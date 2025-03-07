(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const CATEGORY_OPTIONS = [
  { value: "한식", text: "한식" },
  { value: "중식", text: "중식" },
  { value: "일식", text: "일식" },
  { value: "양식", text: "양식" },
  { value: "아시안", text: "아시안" },
  { value: "기타", text: "기타" }
];
const DISTANCE_OPTIONS = [
  { value: "5", text: "5분 내" },
  { value: "10", text: "10분 내" },
  { value: "15", text: "15분 내" },
  { value: "20", text: "20분 내" },
  { value: "30", text: "30분 내" }
];
function CustomDropdown({ label, name, id, options, required }) {
  return `
    <div class="form-item ${"form-item--required"}">
      <label for="${id}" class="text-caption">${label}</label>
      <select name="${name}" id="${id}" ${"required"}>
        <option value="">선택해 주세요</option>
        ${options.map(
    (option) => `<option value="${option.value}">${option.text}</option>`
  ).join("")}
      </select>
    </div>
  `;
}
function CustomInput({
  label,
  name,
  id,
  type = "text",
  required = false
}) {
  return `
      <div class="form-item ${required ? "form-item--required" : ""}">
        <label for="${id}" class="text-caption">${label}</label>
        <input maxlength="2048" type="${type}" name="${name}" id="${id}" ${required ? "required" : ""} />
      </div>
    `;
}
function CustomButton(id = "", className = "", text = "") {
  return `
    <button 
      ${id ? `id="${id}"` : ""}
      type="${id === "" ? "submit" : "button"}" 
      class="button ${className} text-caption"
    >
      ${text}
    </button>
  `;
}
function AddRestaurantModal(container) {
  container.innerHTML += `
        <div class="modal modal--open">
        <div class="modal-backdrop"></div>
        <div class="modal-container">
          <h2 class="modal-title text-title">새로운 음식점</h2>
          <form>
            <!-- 카테고리 -->
             ${CustomDropdown({
    label: "카테고리",
    name: "category",
    id: "category",
    options: CATEGORY_OPTIONS,
    required: true
  })}

            <!-- 음식점 이름 -->
             ${CustomInput({
    label: "이름",
    name: "name",
    id: "name",
    type: "text",
    required: true
  })}
            
            <!-- 거리 -->
              ${CustomDropdown({
    label: "거리(도보 이동 시간)",
    name: "distance",
    id: "distance",
    options: DISTANCE_OPTIONS,
    required: true
  })}
            
            <!-- 설명 -->
            <div class="form-item">
              <label for="description" class="text-caption">설명</label>
              <textarea
                name="description"
                id="description"
                cols="30"
                rows="5"
              ></textarea>
              <span class="help-text text-caption">
                메뉴 등 추가 정보를 입력해 주세요.
              </span>
            </div>

            <!-- 링크 -->
             ${CustomInput({
    label: "참고 링크",
    name: "link",
    id: "link",
    type: "text"
  })}

            <!-- 취소/추가 버튼 -->
            <div class="button-container">
          ${CustomButton("close-modal", "button--secondary", "취소하기")}
          ${CustomButton("", "button--primary", "추가하기")}
            </div>
          </form>
        </div>
      </div>
  `;
}
function Header(container) {
  container.innerHTML += `
    <h1 class="gnb__title text-title">점심 뭐 먹지</h1>
    <button
      id="gnb-button"
      type="button"
      class="gnb__button"
      aria-label="음식점 추가"
    >
      <img src="./add-button.png" alt="음식점 추가" />
    </button>
  `;
}
function RestaurantItem(container, inputValue) {
  container.innerHTML += `
    <li class="restaurant">
      <div class="restaurant__category">
        <img src="./category-${inputValue.categoryCode}.png" alt="${inputValue.categoryValue}" class="category-icon">
      </div>
      <div class="restaurant__info">
        <h3 class="restaurant__name text-subtitle">${inputValue.nameValue}</h3>
        <span class="restaurant__distance text-body">캠퍼스부터 ${inputValue.distanceValue}</span>
        <p class="restaurant__description text-body">${inputValue.descriptionValue}</p>
      </div>
    </li>
  `;
}
function RestaurantList(container) {
  container.innerHTML += `
  <ul class="restaurant-list">
          <li class="restaurant">
            <div class="restaurant__category">
              <img
                src="./category-korean.png"
                alt="한식"
                class="category-icon"
              />
            </div>
            <div class="restaurant__info">
              <h3 class="restaurant__name text-subtitle">피양콩할마니</h3>
              <span class="restaurant__distance text-body"
                >캠퍼스부터 10분 내</span
              >
              <p class="restaurant__description text-body">
                평양 출신의 할머니가 수십 년간 운영해온 비지 전문점 피양콩
                할마니. 두부를 빼지 않은 되비지를 맛볼 수 있는 곳으로, ‘피양’은
                평안도 사투리로 ‘평양’을 의미한다. 딸과 함께 운영하는 이곳에선
                맷돌로 직접 간 콩만을 사용하며, 일체의 조미료를 넣지 않은
                건강식을 선보인다. 콩비지와 피양 만두가 이곳의 대표 메뉴지만,
                할머니가 옛날 방식을 고수하며 만들어내는 비지전골 또한 이 집의
                역사를 느낄 수 있는 특별한 메뉴다. 반찬은 손님들이 먹고 싶은
                만큼 덜어 먹을 수 있게 준비돼 있다.
              </p>
            </div>
          </li>

          <li class="restaurant">
            <div class="restaurant__category">
              <img
                src="./category-chinese.png"
                alt="중식"
                class="category-icon"
              />
            </div>
            <div class="restaurant__info">
              <h3 class="restaurant__name text-subtitle">친친</h3>
              <span class="restaurant__distance text-body"
                >캠퍼스부터 5분 내</span
              >
              <p class="restaurant__description text-body">
                Since 2004 편리한 교통과 주차, 그리고 관록만큼 깊은 맛과
                정성으로 정통 중식의 세계를 펼쳐갑니다
              </p>
            </div>
          </li>

          <li class="restaurant">
            <div class="restaurant__category">
              <img
                src="./category-japanese.png"
                alt="일식"
                class="category-icon"
              />
            </div>
            <div class="restaurant__info">
              <h3 class="restaurant__name text-subtitle">잇쇼우</h3>
              <span class="restaurant__distance text-body"
                >캠퍼스부터 10분 내</span
              >
              <p class="restaurant__description text-body">
                잇쇼우는 정통 자가제면 사누끼 우동이 대표메뉴입니다. 기술은
                정성을 이길 수 없다는 신념으로 모든 음식에 최선을 다하는
                잇쇼우는 고객 한분 한분께 최선을 다하겠습니다
              </p>
            </div>
          </li>

          <li class="restaurant">
            <div class="restaurant__category">
              <img
                src="./category-western.png"
                alt="양식"
                class="category-icon"
              />
            </div>
            <div class="restaurant__info">
              <h3 class="restaurant__name text-subtitle">이태리키친</h3>
              <span class="restaurant__distance text-body"
                >캠퍼스부터 20분 내</span
              >
              <p class="restaurant__description text-body">
                늘 변화를 추구하는 이태리키친입니다.
              </p>
            </div>
          </li>

          <li class="restaurant">
            <div class="restaurant__category">
              <img
                src="./category-asian.png"
                alt="아시안"
                class="category-icon"
              />
            </div>
            <div class="restaurant__info">
              <h3 class="restaurant__name text-subtitle">호아빈 삼성점</h3>
              <span class="restaurant__distance text-body"
                >캠퍼스부터 15분 내</span
              >
              <p class="restaurant__description text-body">
                푸짐한 양에 국물이 일품인 쌀국수
              </p>
            </div>
          </li>

          <li class="restaurant">
            <div class="restaurant__category">
              <img src="./category-etc.png" alt="기타" class="category-icon" />
            </div>
            <div class="restaurant__info">
              <h3 class="restaurant__name text-subtitle">도스타코스 선릉점</h3>
              <span class="restaurant__distance text-body"
                >캠퍼스부터 5분 내</span
              >
              <p class="restaurant__description text-body">
                멕시칸 캐주얼 그릴
              </p>
            </div>
          </li>
        </ul>`;
}
const categoryMapping = {
  한식: "korean",
  중식: "chinese",
  일식: "japanese",
  양식: "western",
  아시안: "asian",
  기타: "etc",
  에러: "error_category"
};
const ERRORS = Object.freeze({
  EMPTY_NAME: "이름은 공백일 수 없습니다.",
  MAXIMUM_NAME: "이름은 30자를 넘길 수 없습니다.",
  MAXIMUM_DESCRIPTION: "설명은 1500자를 넘길 수 없습니다.",
  NON_SELECTED(category) {
    return `${category} 중 하나를 선택해야 합니다.`;
  }
});
const validateNameInput = (rawInput) => {
  const input = rawInput.trim();
  if (input === "") {
    throw new Error(ERRORS.EMPTY_NAME);
  }
  if (input.length > 30) {
    throw new Error(ERRORS.MAXIMUM_NAME);
  }
};
const validateDescriptiontInput = (rawInput) => {
  const input = rawInput.trim();
  if (input.length > 1500) {
    throw new Error(ERRORS.MAXIMUM_DESCRIPTION);
  }
};
const validateSelectInput = (code) => {
  console.log(code);
  if (code === "error_category" || code === "error_distance")
    throw new Error(ERRORS.NON_SELECTED(code.slice(6)));
};
addEventListener("load", () => {
  const $headerContainer = document.querySelector(".gnb");
  Header($headerContainer);
  const $restaurantListContainer = document.querySelector(
    ".restaurant-list-container"
  );
  RestaurantList($restaurantListContainer);
  const $modalButton = document.getElementById("gnb-button");
  const $appContainer = document.getElementById("app");
  $modalButton.addEventListener("click", () => {
    AddRestaurantModal($appContainer);
    const $addRestaurantButton = document.querySelector(".button--primary");
    $addRestaurantButton.addEventListener("click", (e) => {
      e.preventDefault();
      const $category = document.getElementById("category");
      const $name = document.getElementById("name");
      const $distance = document.getElementById("distance");
      const $description = document.getElementById("description");
      try {
        const categoryValue = $category.value || "에러";
        const nameValue = $name.value.trim();
        validateNameInput(nameValue);
        const distanceValue = $distance.value || "error_distance";
        validateSelectInput(distanceValue);
        const descriptionValue = $description.value;
        validateDescriptiontInput(descriptionValue);
        const categoryCode = categoryMapping[categoryValue];
        validateSelectInput(categoryCode);
        const inputValue = {
          categoryCode,
          nameValue,
          distanceValue,
          descriptionValue
        };
        const $restaurantList = document.querySelector(".restaurant-list");
        RestaurantItem($restaurantList, inputValue);
      } catch (error) {
        alert(error.message);
      }
      const $modal = document.querySelector(".modal");
      $modal.remove();
    });
    const $closeModalButton = document.getElementById("close-modal");
    $closeModalButton.addEventListener("click", () => {
      const $modal = document.querySelector(".modal");
      $modal.remove();
    });
  });
});
