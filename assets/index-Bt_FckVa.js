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
const STORAGE_KEYS = {
  RESTAURANTS: "restaurants"
};
function getStoredRestaurants() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEYS.RESTAURANTS);
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error("레스토랑 데이터를 불러오는데 실패했습니다:", error);
    return null;
  }
}
function storeRestaurants(restaurants) {
  try {
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(restaurants));
  } catch (error) {
    console.error("레스토랑 데이터를 저장하는데 실패했습니다:", error);
  }
}
function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEYS.RESTAURANTS);
    console.log("localStorage가 초기화되었습니다.");
    window.location.reload();
  } catch (error) {
    console.error("localStorage 초기화에 실패했습니다:", error);
  }
}
window.clearLocalStorage = clearLocalStorage;
function initializeRestaurants(initialData) {
  const storedRestaurants = getStoredRestaurants();
  if (!storedRestaurants) {
    storeRestaurants(initialData);
    return initialData;
  }
  return storedRestaurants;
}
const defaultRestaurants = [
  {
    id: 1,
    name: "친친",
    category: "chinese",
    categoryName: "중식",
    distance: "5",
    description: "Since 2004 편리한 교통과 주차, 그리고 관록만큼 깊은 맛과 정성으로 정통 중식의 세계를 펼쳐갑니다",
    favorites: false
  },
  {
    id: 2,
    category: "korean",
    categoryName: "한식",
    name: "피양콩할마니",
    distance: "10",
    description: "평양 출신의 할머니가 수십 년간 운영해온 비지 전문점 피양콩 할마니. 두부를 빼지 않은 되비지를 맛볼 수 있는 곳으로, '피양'은 평안도 사투리로 '평양'을 의미한다. 딸과 함께 운영하는 이곳에선 맷돌로 직접 간 콩만을 사용하며, 일체의 조미료를 넣지 않은 건강식을 선보인다. 콩비지와 피양 만두가 이곳의 대표 메뉴지만, 할머니가 옛날 방식을 고수하며 만들어내는 비지전골 또한 이 집의 역사를 느낄 수 있는 특별한 메뉴다. 반찬은 손님들이 먹고 싶은 만큼 덜어 먹을 수 있게 준비돼 있다.",
    favorites: false
  },
  {
    id: 3,
    category: "japanese",
    categoryName: "일식",
    name: "잇쇼우",
    distance: "10",
    description: "잇쇼우는 정통 자가제면 사누끼 우동이 대표메뉴입니다. 기술은 정성을 이길 수 없다는 신념으로 모든 음식에 최선을 다하는 잇쇼우는 고객 한분 한분께 최선을 다하겠습니다",
    favorites: false
  },
  {
    id: 4,
    category: "western",
    categoryName: "양식",
    name: "이태리키친",
    distance: "20",
    description: "늘 변화를 추구하는 이태리키친입니다.",
    favorites: false
  },
  {
    id: 5,
    category: "asian",
    categoryName: "아시안",
    name: "호아빈 삼성점",
    distance: "15",
    description: "푸짐한 양에 국물이 일품인 쌀국수",
    favorites: false
  },
  {
    id: 6,
    category: "etc",
    categoryName: "기타",
    name: "도스타코스 선릉점",
    distance: "5",
    description: "멕시칸 캐주얼 그릴",
    favorites: false
  }
];
const initialRestaurants = initializeRestaurants(defaultRestaurants);
function RestaurantItem(restaurant, isDetailModal = false) {
  const modalStyle = isDetailModal ? ' style="flex-direction: column;"' : "";
  const modalClass = isDetailModal ? " modal-restaurant" : "";
  return `
    <li class="restaurant${modalClass}"${modalStyle} data-category="${restaurant.category}" data-favorites="${restaurant.favorites}" data-restaurant-id="${restaurant.id}">
      <div class="restaurant__category">
        <img src="./category-${restaurant.category}.png" alt="${restaurant.categoryName}" class="category-icon" />
      </div>
      <div class="restaurant__info">
        <div class="restaurant__star__container">
          <div class="restaurant__name__and__distance">
            <h3 class="restaurant__name text-subtitle">${restaurant.name}</h3>
            <span class="restaurant__distance text-body">캠퍼스부터 ${restaurant.distance}분 내</span>
          </div>
          <button class="favorite-button" data-restaurant-id="${restaurant.id}">
            <img src="./${restaurant.favorites ? "fill-star" : "blank-star"}.png"/>
          </button>
        </div>
        <p class="restaurant__description text-body">${restaurant.description}</p>
      </div>
    </li>
  `;
}
function RestaurantList(container, restaurants = initialRestaurants) {
  const render = () => {
    const $restaurantList = document.createElement("ul");
    $restaurantList.className = "restaurant-list";
    const restaurantItemsHTML = restaurants.map((restaurant) => RestaurantItem(restaurant)).join("");
    $restaurantList.innerHTML = restaurantItemsHTML;
    container.appendChild($restaurantList);
  };
  render();
}
function CustomButton(id = "", className = "", text = "") {
  return `
    <button ${id ? `id="${id}"` : ""} type="${id === "" ? "submit" : "button"}" class="button ${className} text-caption">${text}</button>
  `;
}
function AddDetailModal(container, selectedRestaurant) {
  const deleteButton = CustomButton(
    "delete--restaurant",
    "button--secondary",
    "삭제하기"
  );
  const cancelButton = CustomButton("close--modal", "button--primary", "닫기");
  container.innerHTML += /* html */
  `
      <div class="modal modal--open">
        <div class="modal-backdrop"></div>
        <div class="modal-container">
          ${RestaurantItem(selectedRestaurant, true)}
            <div class="button-container">
              ${deleteButton}
              ${cancelButton}
            </div>
        </div>
      </div>
    `;
}
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/javascript-lunch/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = Promise.allSettled(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
function removeModal() {
  const $modal = document.querySelector(".modal");
  if ($modal) {
    const $buttons = $modal.querySelectorAll("button");
    $buttons.forEach((button) => {
      const newButton = button.cloneNode(true);
      if (button.parentNode) {
        button.parentNode.replaceChild(newButton, button);
      }
    });
    const $backdrop = $modal.querySelector(".modal-backdrop");
    if ($backdrop) {
      const newBackdrop = $backdrop.cloneNode(true);
      $backdrop.parentNode.replaceChild(newBackdrop, $backdrop);
    }
    $modal.remove();
    setTimeout(() => {
      resetTabEventListeners();
    }, 0);
  } else {
    console.warn("제거할 모달을 찾을 수 없습니다.");
  }
}
function resetTabEventListeners() {
  try {
    __vitePreload(() => Promise.resolve().then(() => tabHandler), true ? void 0 : void 0).then((module) => {
      if (typeof module.setupTabEventListeners === "function") {
        module.setupTabEventListeners();
      }
    }).catch((err) => {
      console.error("탭 이벤트 리스너 재설정 중 오류 발생:", err);
    });
  } catch (error) {
    console.error("탭 이벤트 리스너 재설정 중 오류 발생:", error);
  }
}
const tabState = {
  activeTab: "all"
};
function handleTabChange(e) {
  const selectedTab = e.target.dataset.tab;
  if (!selectedTab || selectedTab === tabState.activeTab) return;
  const preActiveTab = document.querySelector(".tab-button--active");
  if (preActiveTab) {
    preActiveTab.classList.remove("tab-button--active");
  }
  e.target.classList.add("tab-button--active");
  tabState.activeTab = selectedTab;
  toggleSortingVisibility(selectedTab);
  applyFilter();
  setTimeout(() => {
    setupRestaurantItemEventListeners();
  }, 10);
}
function toggleSortingVisibility(activeTab) {
  const sortingDropdown = document.querySelectorAll(".filter-dropdown");
  sortingDropdown.forEach((dropdown) => {
    if (activeTab === "all") {
      dropdown.style.display = "block";
    } else {
      dropdown.style.display = "none";
    }
  });
  applyFilter();
}
function setupTabEventListeners() {
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach((button) => {
    button.removeEventListener("click", handleTabChange);
    button.addEventListener("click", handleTabChange);
  });
  toggleSortingVisibility(tabState.activeTab);
  setupRestaurantItemEventListeners();
}
const tabHandler = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  handleTabChange,
  setupTabEventListeners,
  tabState
}, Symbol.toStringTag, { value: "Module" }));
const currentFilter = {
  category: null,
  sortBy: "distance"
  // 기본 정렬은 거리순
};
function applyFilter() {
  const $restaurantItems = document.querySelectorAll(".restaurant");
  if ($restaurantItems.length === 0) {
    console.warn("필터링할 레스토랑 항목이 없습니다.");
    return;
  }
  $restaurantItems.forEach((item) => {
    const restaurantItem = item;
    restaurantItem.style.display = "flex";
    if (currentFilter.category !== null) {
      const itemCategory = restaurantItem.dataset.category;
      if (itemCategory !== currentFilter.category) {
        restaurantItem.style.display = "none";
      }
    }
    if (tabState.activeTab === "favorites") {
      const isFavorite = restaurantItem.dataset.favorites === "true";
      if (!isFavorite) {
        restaurantItem.style.display = "none";
      }
    }
  });
  if (currentFilter.sortBy !== null) {
    const $restaurantList = document.querySelector(".restaurant-list");
    if (!$restaurantList) return;
    const visibleItems = Array.from($restaurantList.children);
    visibleItems.sort((a, b) => {
      var _a, _b, _c, _d, _e, _f;
      if (currentFilter.sortBy === "distance") {
        const distanceTextA = ((_a = a.querySelector(".restaurant__distance")) == null ? void 0 : _a.textContent) || "0";
        const distanceTextB = ((_b = b.querySelector(".restaurant__distance")) == null ? void 0 : _b.textContent) || "0";
        const distanceA = parseInt(((_c = distanceTextA.match(/\d+/)) == null ? void 0 : _c[0]) || "0");
        const distanceB = parseInt(((_d = distanceTextB.match(/\d+/)) == null ? void 0 : _d[0]) || "0");
        return distanceA - distanceB;
      }
      if (currentFilter.sortBy === "name") {
        const nameA = ((_e = a.querySelector(".restaurant__name")) == null ? void 0 : _e.textContent) || "";
        const nameB = ((_f = b.querySelector(".restaurant__name")) == null ? void 0 : _f.textContent) || "";
        return nameA.localeCompare(nameB, "ko");
      }
      return 0;
    });
    visibleItems.forEach((item) => {
      $restaurantList.appendChild(item);
    });
  }
}
function handleCategoryFilter(e) {
  const target = e.target;
  const selectedCategory = target.value;
  currentFilter.category = selectedCategory === "all" ? null : selectedCategory;
  applyFilter();
}
function handleSortingFilter(e) {
  const target = e.target;
  const selectedSorting = target.value;
  currentFilter.sortBy = selectedSorting;
  applyFilter();
}
function setupFilterEventListeners() {
  const $categoryFilter = document.getElementById("category-filter");
  const $sortingFilter = document.getElementById("sorting-filter");
  if ($categoryFilter) {
    $categoryFilter.addEventListener("change", handleCategoryFilter);
  } else {
    console.warn("카테고리 필터 요소를 찾을 수 없습니다.");
  }
  if ($sortingFilter) {
    $sortingFilter.addEventListener("change", handleSortingFilter);
  } else {
    console.warn("정렬 필터 요소를 찾을 수 없습니다.");
  }
}
const ERRORS = Object.freeze({
  EMPTY_NAME: "이름은 공백일 수 없습니다.",
  MAXIMUM_NAME: "이름은 30자를 넘길 수 없습니다.",
  MAXIMUM_DESCRIPTION: "설명은 1500자를 넘길 수 없습니다.",
  NON_SELECTED: (fieldType) => `${fieldType} 중 하나를 선택해야 합니다.`
});
const ERROR_TYPES = Object.freeze({
  CATEGORY: "category",
  DISTANCE: "distance"
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
const validateSelectInput = (value, fieldType) => {
  if (!value || value === "") {
    throw new Error(ERRORS.NON_SELECTED(fieldType));
  }
};
function generateId() {
  const maxId = Math.max(
    ...initialRestaurants.map((restaurant) => restaurant.id),
    0
  );
  return maxId + 1;
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
function handleAddRestaurant(e) {
  e.preventDefault();
  const $category = document.getElementById("category");
  const $name = document.getElementById("name");
  const $distance = document.getElementById("distance");
  const $description = document.getElementById("description");
  if (!$category || !$name || !$distance || !$description) {
    alert("필수 입력 필드를 찾을 수 없습니다.");
    return;
  }
  try {
    const categoryValue = $category.value || "";
    const nameValue = $name.value.trim();
    validateNameInput(nameValue);
    const distanceValue = $distance.value || "";
    validateSelectInput(distanceValue, ERROR_TYPES.DISTANCE);
    const descriptionValue = $description.value;
    validateDescriptiontInput(descriptionValue);
    const category = categoryMapping[categoryValue];
    validateSelectInput(category, ERROR_TYPES.CATEGORY);
    const newRestaurant = {
      id: generateId(),
      category,
      categoryName: categoryValue,
      name: nameValue,
      distance: distanceValue,
      description: descriptionValue,
      favorites: false
    };
    initialRestaurants.push(newRestaurant);
    storeRestaurants(initialRestaurants);
    const $restaurantList = document.querySelector(".restaurant-list");
    if ($restaurantList) {
      const restaurantItemHTML = RestaurantItem(newRestaurant);
      $restaurantList.innerHTML += restaurantItemHTML;
      setupRestaurantItemEventListeners();
      setupFavoriteEventListeners();
    } else {
      console.warn("레스토랑 목록을 DOM에서 찾을 수 없습니다.");
      alert("레스토랑 목록을 찾을 수 없습니다.");
      return;
    }
    removeModal();
  } catch (error) {
    alert(error.message);
  }
}
function rerenderRestaurantList(restaurantId) {
  const $restaurantList = document.querySelector(".restaurant-list");
  if (!$restaurantList) return;
  const visibleItems = initialRestaurants.filter((restaurant) => {
    return true;
  });
  $restaurantList.innerHTML = visibleItems.map(
    (restaurant) => RestaurantItem(restaurant)
  ).join("");
  setupRestaurantItemEventListeners();
  setupFavoriteEventListeners();
}
function handleFavoriteClick(e) {
  e.stopPropagation();
  const $favoriteButton = e.target.closest(".favorite-button");
  const restaurantId = Number($favoriteButton.dataset.restaurantId);
  const updatedRestaurants = initialRestaurants.map((restaurant) => {
    if (restaurant.id === restaurantId) {
      return {
        ...restaurant,
        favorites: !restaurant.favorites
      };
    }
    return restaurant;
  });
  Object.assign(initialRestaurants, updatedRestaurants);
  storeRestaurants(updatedRestaurants);
  const $starImg = $favoriteButton.querySelector("img");
  const $restaurantElement = $favoriteButton.closest(".restaurant");
  const newFavoriteState = !($restaurantElement.dataset.favorites === "true");
  $starImg.src = `./${newFavoriteState ? "fill-star" : "blank-star"}.png`;
  $restaurantElement.dataset.favorites = String(newFavoriteState);
  rerenderRestaurantList();
  applyFilter();
}
function setupFavoriteEventListeners() {
  const $favoriteButtons = document.querySelectorAll(".favorite-button");
  $favoriteButtons.forEach((button) => {
    button.addEventListener("click", handleFavoriteClick);
  });
}
let selectedRestaurantId = null;
let eventListenersAttached = false;
function handleRestaurantClick(e) {
  const $clickedItem = e.target.closest(".restaurant");
  if (!$clickedItem || $clickedItem.classList.contains("modal-restaurant")) {
    return;
  }
  const restaurantId = $clickedItem.dataset.restaurantId;
  selectedRestaurantId = Number(restaurantId);
  const selectedRestaurant = initialRestaurants.find(
    (restaurant) => restaurant.id === Number(restaurantId)
  );
  const $appContainer = document.getElementById("app");
  setupAddDetailtModal($appContainer, selectedRestaurant);
}
function handleDeleteRestaurant(e) {
  e.preventDefault();
  e.stopPropagation();
  const $restaurantList = document.querySelector(".restaurant-list");
  const $restaurantItems = $restaurantList.querySelectorAll(".restaurant");
  $restaurantItems.forEach((item) => {
    const restaurantItemId = item.dataset.restaurantId;
    if (Number(restaurantItemId) === Number(selectedRestaurantId)) {
      item.remove();
    }
  });
  removeAllModalEventListeners();
  removeModal();
  setTimeout(() => {
    resetAllEventListeners();
  }, 10);
}
function handleCloseModal(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  removeAllModalEventListeners();
  removeModal();
  setTimeout(() => {
    resetAllEventListeners();
  }, 10);
}
function handleModalBackdropClick(e) {
  e.preventDefault();
  e.stopPropagation();
  removeAllModalEventListeners();
  removeModal();
  selectedRestaurantId = null;
  setTimeout(() => {
    resetAllEventListeners();
  }, 10);
}
function resetAllEventListeners() {
  setupTabEventListeners();
  setupRestaurantItemEventListeners();
  setupFilterEventListeners();
  setupFavoriteEventListeners();
}
function removeAllModalEventListeners() {
  if (!eventListenersAttached) return;
  const $deleteButton = document.querySelector("#delete--restaurant");
  const $closeButton = document.querySelector("#close--modal");
  const $modalBackdrop = document.querySelector(".modal-backdrop");
  if ($deleteButton) {
    $deleteButton.removeEventListener("click", handleDeleteRestaurant);
  }
  if ($closeButton) {
    $closeButton.removeEventListener("click", handleCloseModal);
  }
  if ($modalBackdrop) {
    $modalBackdrop.removeEventListener("click", handleModalBackdropClick);
  }
  eventListenersAttached = false;
}
function setupRestaurantItemEventListeners() {
  const $restaurantItems = document.querySelectorAll(
    ".restaurant:not(.modal-restaurant)"
  );
  $restaurantItems.forEach((item) => {
    item.removeEventListener("click", handleRestaurantClick);
    item.addEventListener("click", handleRestaurantClick);
  });
}
function setupAddDetailtModal($container, selectedRestaurant) {
  const existingModal = document.querySelector(".modal");
  if (existingModal) {
    removeAllModalEventListeners();
    existingModal.remove();
  }
  AddDetailModal($container, selectedRestaurant);
  const $deleteButton = document.querySelector("#delete--restaurant");
  const $closeButton = document.querySelector("#close--modal");
  const $modalBackdrop = document.querySelector(".modal-backdrop");
  if ($deleteButton) {
    $deleteButton.addEventListener("click", handleDeleteRestaurant);
  } else {
    console.warn("삭제 버튼을 DOM에서 찾을 수 없습니다.");
  }
  if ($closeButton) {
    $closeButton.addEventListener("click", handleCloseModal);
  } else {
    console.warn("모달 닫기 버튼을 DOM에서 찾을 수 없습니다.");
  }
  if ($modalBackdrop) {
    $modalBackdrop.addEventListener("click", handleModalBackdropClick);
  }
  eventListenersAttached = true;
  setupFavoriteEventListeners();
}
function initializeRestaurantList() {
  const $restaurantContainer = document.querySelector(
    ".restaurant-list-container"
  );
  if ($restaurantContainer) {
    RestaurantList($restaurantContainer);
    setupRestaurantItemEventListeners();
  } else {
    console.error("레스토랑 컨테이너 요소를 찾을 수 없습니다.");
  }
}
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
const CATEGORY_FILTER_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "korean", label: "한식" },
  { value: "chinese", label: "중식" },
  { value: "japanese", label: "일식" },
  { value: "western", label: "양식" },
  { value: "asian", label: "아시안" },
  { value: "etc", label: "기타" }
];
const SORTING_OPTIONS = [
  { value: "distance", label: "거리순" },
  { value: "name", label: "이름순" }
];
function CustomDropdown(props) {
  const {
    label,
    name,
    id,
    options,
    required = false,
    selectFirst = false,
    type = "form"
    // 기본값은 form으로 설정 (모달용)
  } = props;
  if (type === "filter") {
    const optionsHTML2 = options.map((option) => {
      return `<option value="${option.value}">${option.text}</option>`;
    }).join("");
    return `
      <div class="dropdown-container">
        ${label ? `<label for="${id}" class="dropdown-label">${label}</label>` : ""}
        <select 
          name="${name}" 
          id="${id}" 
          ${required ? "required" : ""}
        >
          ${optionsHTML2}
        </select>
      </div>
    `;
  }
  const optionsHTML = options.map((option) => {
    return `<option value="${option.value}">${option.text}</option>`;
  }).join("");
  return `
      <div class="form-item ${required ? "form-item--required" : ""}">
        <label for="${id}" class="text-caption">${label}</label>
        <select 
          name="${name}" 
          id="${id}" 
          ${required ? "required" : ""}
        >
          ${!selectFirst ? '<option value="">선택해 주세요</option>' : ""}
          ${optionsHTML}
        </select>
      </div>
    `;
}
function RestaurantFilterContainer(container) {
  const categoryDropdown = CustomDropdown({
    label: "",
    name: "category",
    id: "category-filter",
    options: CATEGORY_FILTER_OPTIONS.map((option) => ({
      value: option.value,
      text: option.label
    })),
    required: false,
    selectFirst: true,
    type: "filter"
    // 필터용임을 명시
  });
  const sortingDropdown = CustomDropdown({
    label: "",
    name: "sorting",
    id: "sorting-filter",
    options: SORTING_OPTIONS.map((option) => ({
      value: option.value,
      text: option.label
    })),
    required: false,
    selectFirst: true,
    type: "filter"
  });
  container.innerHTML += `
      <div class="filter-dropdown">
        ${categoryDropdown}
      </div>
      <div class="filter-dropdown">
        ${sortingDropdown}
      </div>
  `;
}
function initializeFilters() {
  const $filterContainer = document.querySelector(
    ".restaurant-filter-container"
  );
  if ($filterContainer) {
    RestaurantFilterContainer($filterContainer);
    setupFilterEventListeners();
    setupFavoriteEventListeners();
  } else {
    console.error("필터 컨테이너 요소를 찾을 수 없습니다.");
  }
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
function AddRestaurantModal(container) {
  const formFields = [
    {
      type: "dropdown",
      label: "카테고리",
      name: "category",
      id: "category",
      options: CATEGORY_OPTIONS,
      required: true
    },
    {
      type: "input",
      label: "이름",
      name: "name",
      id: "name",
      inputType: "text",
      required: true
    },
    {
      type: "dropdown",
      label: "거리(도보 이동 시간)",
      name: "distance",
      id: "distance",
      options: DISTANCE_OPTIONS,
      required: true
    },
    {
      type: "textarea",
      label: "설명",
      name: "description",
      id: "description",
      cols: 30,
      rows: 5,
      helpText: "메뉴 등 추가 정보를 입력해 주세요."
    },
    {
      type: "input",
      label: "참고 링크",
      name: "link",
      id: "link",
      inputType: "text",
      required: false
    }
  ];
  const formFieldsHTML = formFields.map((field) => {
    switch (field.type) {
      case "dropdown":
        return CustomDropdown({
          label: field.label,
          name: field.name,
          id: field.id,
          options: field.options,
          required: field.required
        });
      case "input":
        return CustomInput({
          label: field.label,
          name: field.name,
          id: field.id,
          type: field.inputType,
          required: field.required
        });
      case "textarea":
        return `
          <div class="form-item">
            <label for="${field.id}" class="text-caption">${field.label}</label>
            <textarea
              name="${field.name}"
              id="${field.id}"
              cols="${field.cols}"
              rows="${field.rows}"
            ></textarea>
            ${field.helpText ? `<span class="help-text text-caption">${field.helpText}</span>` : ""}
          </div>
        `;
      default:
        return "";
    }
  }).join("");
  const cancelButton = CustomButton(
    "close-modal",
    "button--secondary",
    "취소하기"
  );
  const submitButton = CustomButton("", "button--primary", "추가하기");
  container.innerHTML += /* html */
  `
    <div class="modal modal--open">
      <div class="modal-backdrop"></div>
      <div class="modal-container">
        <h2 class="modal-title text-title">새로운 음식점</h2>
        <form>
          ${formFieldsHTML}
          <div class="button-container">
            ${cancelButton}
            ${submitButton}
          </div>
        </form>
      </div>
    </div>
  `;
}
function setupModalEventListeners() {
  const $addRestaurantButton = document.querySelector(".button--primary");
  const $closeModalButton = document.getElementById("close-modal");
  if ($addRestaurantButton) {
    $addRestaurantButton.addEventListener("click", handleAddRestaurant);
  } else {
    console.warn("레스토랑 추가 버튼을 DOM에서 찾을 수 없습니다.");
  }
  if ($closeModalButton) {
    $closeModalButton.addEventListener("click", () => {
      removeModal();
    });
  } else {
    console.warn("모달 닫기 버튼을 DOM에서 찾을 수 없습니다.");
  }
}
function setupAddRestaurantModal($container) {
  AddRestaurantModal($container);
  setupModalEventListeners();
}
function initializeModalButton() {
  const $modalButton = document.getElementById("gnb-button");
  const $appContainer = document.getElementById("app");
  if (!$appContainer) {
    console.warn("앱 컨테이너를 DOM에서 찾을 수 없습니다.");
    return;
  }
  if ($modalButton) {
    $modalButton.addEventListener("click", () => {
      setupAddRestaurantModal($appContainer);
    });
  } else {
    console.warn("모달 버튼을 DOM에서 찾을 수 없습니다.");
  }
}
function RestaurantTabs(container, activeTab = "all") {
  const tabsHTML = `
    <div class="restaurant-tabs">
      <button 
        class="tab-button ${activeTab === "all" ? "tab-button--active" : ""}" 
        data-tab="all">
        모든 음식점
      </button>
      <button 
        class="tab-button ${activeTab === "favorites" ? "tab-button--active" : ""}" 
        data-tab="favorites">
        자주 가는 음식점
      </button>
    </div>
  `;
  container.innerHTML += tabsHTML;
  return container.querySelector(".restaurant-tabs");
}
function initializeTabs() {
  const $tabsContainer = document.querySelector(".restaurant-tabs-container");
  if ($tabsContainer) {
    RestaurantTabs($tabsContainer);
    setupTabEventListeners();
  } else {
    console.error("탭 컨테이너를 찾을 수 없습니다.");
  }
}
addEventListener("load", () => {
  initializeRestaurantList();
  initializeFilters();
  initializeModalButton();
  initializeTabs();
});
