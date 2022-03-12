/*
 1. [] 검색어를 입력할 경우 서버로 부터 데이터를 전달 받는다.
 2. [] 전달받은 데이터를 div 컨테이너에 보여준다.
 3. [] 전달받은 데이터에서 입력한 값과 같을 경우 그 부분을 클래스""Suggestion__item--matched"를 적용한다.
 4. [] 순회중인 데이터는 "Suggestion__item--selected" class를 사용한다.
 5. [] 이 상태에서 엔터키를 누르는 경우, 아래 명시된 언어 선택 동작이 이루어지도록 합니다.
 6. 화살표 키를 누를 때는 검색 동작이 일어나면 안 됩니다. 관련하여 예외처리를 적절하게 해주세요.
 7. 순회 시 첫번째 요소에서 화살표 위를 누르면 맨 끝으로, 맨 끝에서 화살표 아래를 누르면 맨 처음으로 와야 합니다.
 8. input 내 검색어를 모두 삭제할 경우, 추천 검색어 및 추천 검색어를 띄워준 창을 보이지 않게 합니다.

 - 언어 선택
 1. [] 언어 선택 처리를 합니다. 
 2. [] 언어 목록이 렌더링 된 상태에서 엔터키를 누르는 경우, 현재 선택처리된 언어를 alert으로 띄우고 아래에 제시된 동작을 합니다.
 3. [] 언어 목록이 렌더링 된 상태에서 언어를 클릭한 경우, 해당 언어를 alert으로 띄우고 아래에 제시된 동작을 합니다.
 4. [] 단순히 선택된 검색어에 대해 alert만 띄우면 됩니다.
 5. [] 다른 문자열 첨가 없이 언어명만 alert으로 띄워야 합니다.
- 선택 언어 렌더링
 1. [] 선택된 검색어를 alert으로 노출한 다음, 주어진 마크업을 참고하여 SelectedLanguage에 렌더링 합니다.
 2. [] 이미 선택된 언어를 다시 검색하여 선택처리하여도 중복으로 들어가서는 안 됩니다.
 3. [] 이미 선택된 언어를 다시 넣으면 순서상 맨 뒤로 들어가야 합니다.
    예시: JavaScript, TypeScript, Python이 선택된 상태에서 JavaScript를 다시 검색해서 선택하면 TypeScript, Python, JavaScript 순서가 되어야 함
 4. [] 언어는 최대 다섯개까지 넣을 수 있으며, 다섯개를 초과하는 경우 가장 처음에 넣은 언어를 제거하고 넣습니다. (FIFO)
 5. [] 예시: ActionScript, JavaScript, TypeScript, Java, Python이 들어간 상태에서 Kotlin을 검색하고 선택한다면 JavaScript, TypeScript, Java, Python, Kotlin이 되어야 함
 프로그래밍 언어 조회
/languages
Method : GET
Query Parameter : keyword
검색하고자 하는 키워드를 query parameter로 넘기면 조건에 맞는 데이터를 조회하여 응답합니다.
// 'java'라는 키워드로 조회
/languages?keyword=java

// 응답 결과는 다음과 같습니다.
[
"Java",
"JavaFX Script",
"JavaScript",
"Join Java"
]
*/

import { $ } from "./utils.js";
import { BASE_URL } from "./const.js";

function App() {
  this.selectedLanguageList = [];
  this.init = () => {
    $(".Suggestion").style.display = "none";
    initEventListener();
  };
  const $searchLanguage = $(".SearchInput__input");
  const $searchForm = $(".SearchInput");
  const $suggestionContainer = $(".Suggestion");
  const $selectedLanguageContainer = $(".SelectedLanguage");
  const $selectedLanguageList = $selectedLanguageContainer.querySelector("ul");

  const renderSuggestionContainer = async () => {
    if ($searchLanguage.value.length > 2) {
      const languageList = await getLanguageList($searchLanguage.value);
      $suggestionContainer.innerHTML = "";
      if (languageList.length > 0) {
        const $ul = document.createElement("ul");
        for (let language of languageList) {
          const find = $searchLanguage.value;
          const regexp = new RegExp(find, "gi");
          const matchedWord = language.match(regexp);
          language = language.replace(
            regexp,
            `<span class="Suggestion__item--matched">${matchedWord}</span>`
          );
          const $li = document.createElement("li");
          $li.innerHTML = language;
          $ul.append($li);
        }
        $suggestionContainer.append($ul);
        $suggestionContainer.style.display = "block";
      } else {
        $suggestionContainer.innerHTML = "";
        $suggestionContainer.style.display = "none";
      }
    }
    if ($searchLanguage.value.length === 0) {
      $suggestionContainer.innerHTML = "";
      $suggestionContainer.style.display = "none";
    }
  };


  const renderSelectedLanguageList = () => {
    const template = this.selectedLanguageList
      .map((language) => languageTemplate(language))
      .join("");
    $selectedLanguageList.innerHTML = template;
  };

  const keepCountOfLanguages = () => {
    if (this.selectedLanguageList.length > 5) {
      this.selectedLanguageList.shift();
    }
  };

  const languageTemplate = (language) => {
    return `<li>${language}</li>`;
  };

  const getLanguageList = async (language) => {
    const response = await fetch(`${BASE_URL}/languages?keyword=${language}`);
    if (!response.ok) {
      throw new Error("에러 발생");
    }
    const languageList = await response.json();
    return languageList;
  };

  const changeHighlightedLanguage = (key) => {
    const $suggestionList = $suggestionContainer.querySelectorAll("li");
    let target;
    const initIndex = key === "ArrowUp" ? $suggestionList.length - 1 : 0;

    const $selectedLanguage = $suggestionContainer.querySelector(
      "li.Suggestion__item--selected"
    );

    const adjacentSibling =
      $selectedLanguage &&
      (e.key === "ArrowUp"
        ? $selectedLanguage.previousSibling
        : $selectedLanguage.nextSibling);

    target = adjacentSibling || $suggestionList[initIndex];

    $selectedLanguage?.classList.remove("Suggestion__item--selected");
    target.classList.add("Suggestion__item--selected");
  };

  const closeSuggestion = () => {
    $suggestionContainer.style.display = "none";
    $suggestionContainer.innerHTML = "";
  };

  const selectLanguage = (language) => {
    alert(language);
    removeReduplicated(language);
    this.selectedLanguageList.push(language);
    keepCountOfLanguages();
    renderSelectedLanguageList();
  };

  const removeReduplicated = (language) => {
    this.selectedLanguageList = this.selectedLanguageList.filter(
      (selectedLanguage) => language !== selectedLanguage
    );
  };

  const controlSuggestionContainer = async (e) => {
    if (e.key == "Enter") e.preventDefault();
    await renderSuggestionContainer();
    if (e.key === "Escape") {
      closeSuggestion();
    }
    if (
      (e.key === "ArrowUp" || e.key === "ArrowDown") &&
      $suggestionContainer.style.display === "block"
    ) {
      changeHighlightedLanguage(e.key);
    }
  };

  const debounce = (callback, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => callback(...args), delay);
    };
  };

  const initEventListener = () => {
    $searchLanguage.addEventListener(
      "keyup",
      async (e) => await controlSuggestionContainer(e)
    );

    $suggestionContainer.addEventListener("click", (e) =>
      selectLanguage(e.target.textContent)
    );

    $searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
    });
  };
}

const app = new App();
app.init();
