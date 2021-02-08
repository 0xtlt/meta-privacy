(function () {
  let storage = localStorage.getItem("privacySettings") || {};
  try {
    storage = JSON.parse(storage);
  } catch (e) {
    storage = {
      cookies: [],
      collectedData: [],
    };
  }

  const supportedList = {
    cookies: ["session", "analytics"],
    collectedData: ["ip", "history", "microphone", "camera"],
  };

  const locales = {
    en: {
      heading: "Website Permissions",
      labels: {
        required: "Required",
        submit: "Validate",
        accept: "Accept",
      },
      cookies: {
        session: {
          name: "Session",
          description: "Used to connect and interact",
        },
        analytics: {
          name: "Analytics",
          description: "Used to improve content",
        },
      },
      collectedData: {
        ip: {
          name: "IP Address",
          description: "Link your internet address to you",
        },
        history: {
          name: "History",
          description: "Uses your browsing history on the current tab",
        },
        microphone: {
          name: "Microphone",
          description: "Allows the collection of audio data from your browser",
        },
        camera: {
          name: "Camera",
          description: "Allows the collection of images from your browser",
        },
      },
    },
  };

  function getLocale() {
    let browserLocale = "";
    if (navigator.languages != undefined) {
      browserLocale = navigator.languages[0].split("-")[0];
    } else {
      browserLocale = navigator.language.split("-")[0];
    }

    if (!locales[browserLocale]) {
      return locales.en;
    } else {
      return locales[browserLocale];
    }
  }

  const LOCALE = getLocale();

  function uuid() {
    return "xxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  navigator["privacy"] = {
    ...storage,
    metas: {
      cookies: document
        .querySelector('meta[name="cookies"]')
        .content.split(",")
        .map((cookie) =>
          cookie
            .toLowerCase()
            .split(",")
            .map((need) => need.trim()),
        )
        .flat(),
      collectedData: document
        .querySelector('meta[name="collected-data"]')
        .content.split(",")
        .map((cookie) =>
          cookie
            .toLowerCase()
            .split(",")
            .map((need) => need.trim()),
        )
        .flat(),
    },
    requirements: {
      collectedData: document
        .querySelector('meta[name="required-collected-data"]')
        .content.split(",")
        .map((data) =>
          data
            .toLowerCase()
            .split(",")
            .map((need) => need.trim()),
        )
        .flat(),
      cookies: document
        .querySelector('meta[name="required-cookies"]')
        .content.split(",")
        .map((cookie) =>
          cookie
            .toLowerCase()
            .split(",")
            .map((need) => need.trim()),
        )
        .flat(),
    },
    askRequirement: function (
      params = { cookies: [], collectedData: [] },
      areRequired = false,
    ) {
      const askRequirementEvent = new CustomEvent("askRequirement", {
        detail: {
          requirements: params,
          areRequired,
        },
        bubbles: true,
        cancelable: true,
        composed: false,
      });
      document.dispatchEvent(askRequirementEvent);
    },
  };

  const PREFIX = "mp-" + uuid();

  let styles = `
  .${PREFIX}-checkboxList__checkbox {
    position: absolute;
    left: -9999px;
  }
  .${PREFIX}-checkboxList__checkbox + label {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    background-color: #e74c3c;
    cursor: pointer;
    width: 100px;
    height: 40px;
    margin-top: 10px;
    box-shadow: 0px 2px 4px rgb(45 35 66 / 40%),
      0px 7px 13px -3px rgb(45 35 66 / 30%),
      inset 0px -3px 0px rgb(58 65 111 / 50%);
    text-shadow: 0 1px 0 rgb(0 0 0 / 40%);
    transition: 0.2s ease;
  }
  .${PREFIX}-checkboxList__checkbox:disabled + label {
      opacity: 0.5;
      cursor: not-allowed;
  }
  .${PREFIX}-checkboxList__checkbox:checked + label {
    background: #2ecc71;
    box-shadow: inset 0px 3px 7px #208e4e;
    transform: translateY(2px);
  }

  .${PREFIX}-shine {
    display: block;
    margin: auto;
    margin-top: 25px;
    color: white;
    transition: box-shadow 0.15s ease, transform 0.15s ease;
    will-change: box-shadow, transform;
    background: radial-gradient(100% 100% at 100% 0%, #89e5ff 0%, #5468ff 100%);
    box-shadow: 0px 2px 4px rgb(45 35 66 / 40%),
      0px 7px 13px -3px rgb(45 35 66 / 30%),
      inset 0px -3px 0px rgb(58 65 111 / 50%);
    text-shadow: 0 1px 0 rgb(0 0 0 / 40%);
    min-width: 200px;
    padding: 10px 24px;
    border-radius: 10px;
    border: 0;
    position: relative;
    cursor: pointer;
    overflow: hidden;
  
    --x: 0;
    --y: 0;
    --shineColor: rgba(255, 255, 255, 0.2);
    --size: 0;
  }
  
  .${PREFIX}-shine:before {
    content: "";
    position: absolute;
    z-index: 1;
    left: 0;
    top: 0;
    width: var(--size);
    height: var(--size);
    background: radial-gradient(
      circle closest-side,
      var(--shineColor),
      transparent
    );
    transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y)));
    transition: height 0.2s ease;
    will-change: width, height, transform;
  }
  
  .${PREFIX}-shine:hover {
    outline: none;
    box-shadow: 0px 4px 8px rgb(45 35 66 / 40%),
      0px 7px 13px -3px rgb(45 35 66 / 30%), inset 0px -3px 0px #3c4fe0;
    transform: translateY(-2px);
  }
  
  .${PREFIX}-shine:active {
    outline: none;
    box-shadow: inset 0px 3px 7px #3c4fe0;
    transform: translateY(2px);
  }
  
  .${PREFIX}-shine:focus {
    outline: none;
  }
  `;

  // body block scroll
  styles += `.${PREFIX}-blockScroll { overflow: hidden !important; }`;
  document.body.classList.add(PREFIX + "-blockScroll");

  const body = document.createElement("div");
  // shadow
  styles += `.${PREFIX}-shadow * {box-sizing: border-box;font-family: sans-serif; } .${PREFIX}-shadow { display: flex; background: rgba(0,0,0,.8); position: fixed; z-index: 999999999; left:0;top: 0;width: 100%;height: 100%; }`;
  body.className = PREFIX + "-shadow";

  const box = document.createElement("div");
  // box
  styles += `.${PREFIX}-box { border-radius: 10px; box-shadow: 0px 2px 4px rgb(45 35 66 / 40%), 0px 7px 13px -3px rgb(45 35 66 / 30%), inset 0px -3px 0px rgb(58 65 111 / 50%); background: white; margin: auto; padding: 30px; width: 1024px; max-width: calc(100% - 40px); max-height: 90vh; overflow: auto;}`;
  box.className = PREFIX + "-box";
  body.appendChild(box);

  const heading = document.createElement("span");
  // heading
  styles += `.${PREFIX}-heading { font-size: 18px; font-weight: bold;display: block;text-align: center; margin-bottom: 25px; }`;
  heading.className = PREFIX + "-heading";
  heading.innerText = LOCALE.heading;
  box.appendChild(heading);

  // lists
  styles += `.${PREFIX}-lists { display: grid; grid-gap: 25px; grid-template-columns: 1fr 1fr;width: 100%; }.${PREFIX}-lists span {display: block;}`;

  const cookiesList = document.createElement("div");
  // Cookies list
  cookiesList.className = PREFIX + "-lists";
  box.appendChild(cookiesList);

  styles += `.${PREFIX}-sub {margin-top: 25px;} .${PREFIX}-categoryHeading { font-weight: bold; display: block; margin-bottom:5px; }`;
  let indexForSystem = 0;

  for (let i = 0; i < navigator["privacy"].metas.cookies.length; i++) {
    const cookie = navigator["privacy"].metas.cookies[i];
    if (supportedList.cookies.includes(cookie)) {
      let isRequired = navigator["privacy"].requirements.cookies.includes(
        cookie,
      );

      const boxInBox = document.createElement("div");

      const boxInBox_heading = document.createElement("span");
      boxInBox_heading.className = PREFIX + "-categoryHeading";
      boxInBox_heading.innerText =
        LOCALE.cookies[cookie].name +
        (isRequired ? " - " + LOCALE.labels.required : "");

      const boxInBox_description = document.createElement("span");
      boxInBox_description.innerText = LOCALE.cookies[cookie].description;
      boxInBox.appendChild(boxInBox_heading);
      boxInBox.appendChild(boxInBox_description);

      const boxInBox_checkbox = document.createElement("div");
      boxInBox_checkbox.innerHTML = `<input ${
        isRequired ? "disabled checked" : "checked"
      } type="checkbox" data-type="cookie" value="${cookie}" name="${PREFIX}-${indexForSystem}" id="${PREFIX}-${indexForSystem}" class="${PREFIX}-checkboxList__checkbox"/>
      <label for="${PREFIX}-${indexForSystem}">
        <span>${LOCALE.labels.accept}</span>
      </label>`;
      indexForSystem++;
      boxInBox.appendChild(boxInBox_checkbox);

      cookiesList.appendChild(boxInBox);
    }
  }

  const dataList = document.createElement("div");
  // collectedData list
  dataList.className = PREFIX + "-lists " + PREFIX + "-sub";
  box.appendChild(dataList);

  for (let i = 0; i < navigator["privacy"].metas.collectedData.length; i++) {
    const collectedData = navigator["privacy"].metas.collectedData[i];
    if (supportedList.collectedData.includes(collectedData)) {
      const boxInBox = document.createElement("div");

      let isRequired = navigator["privacy"].requirements.collectedData.includes(
        collectedData,
      );

      const boxInBox_heading = document.createElement("span");
      boxInBox_heading.innerText =
        LOCALE.collectedData[collectedData].name +
        (isRequired ? " - " + LOCALE.labels.required : "");

      boxInBox_heading.className = PREFIX + "-categoryHeading";

      const boxInBox_description = document.createElement("span");
      boxInBox_description.innerText =
        LOCALE.collectedData[collectedData].description;
      boxInBox.appendChild(boxInBox_heading);
      boxInBox.appendChild(boxInBox_description);

      const boxInBox_checkbox = document.createElement("div");
      boxInBox_checkbox.innerHTML = `<input ${
        isRequired ? "disabled checked" : "checked"
      } type="checkbox" data-type="collectedData" value="${collectedData}" name="${PREFIX}-${indexForSystem}" id="${PREFIX}-${indexForSystem}" class="${PREFIX}-checkboxList__checkbox"/>
      <label for="${PREFIX}-${indexForSystem}">
        <span>${LOCALE.labels.accept}</span>
      </label>`;
      indexForSystem++;
      boxInBox.appendChild(boxInBox_checkbox);

      dataList.appendChild(boxInBox);
    }
  }

  function checkRequirements() {
    const check_1 = navigator["privacy"].requirements.cookies.filter(
      (cookie) => !navigator["privacy"].cookies.includes(cookie),
    );
    const check_2 = navigator["privacy"].requirements.collectedData.filter(
      (collectedData) =>
        !navigator["privacy"].collectedData.includes(collectedData),
    );

    return check_1.length + check_2.length;
  }

  const button = document.createElement("button");
  // collectedData list
  button.className = PREFIX + "-shine";
  button.innerText = LOCALE.labels.submit;
  box.appendChild(button);

  const styleNode = document.createElement("style");
  styleNode.innerHTML = styles;
  if (checkRequirements()) {
    document.head.appendChild(styleNode);
    document.body.appendChild(body);
  }

  button.addEventListener("mousemove", onMouseMove);
  button.addEventListener("mouseout", onMouseOut);
  button.addEventListener("click", submit);

  function onMouseMove(event) {
    event.target.style = `--x: ${event.layerX}px;--y: ${event.layerY}px;--size: 250px;`;
  }

  function onMouseOut(event) {
    event.target.style = `--x: 0;--y: 0;--size: 0;`;
  }

  function submit() {
    const event = new CustomEvent("privacyChanged", {
      detail: {},
      bubbles: true,
      cancelable: false,
      composed: false,
    });

    const collectedData = [
      ...box.querySelectorAll('input[data-type="collectedData"]:checked'),
    ].map((node) => node.value);

    const cookies = [
      ...box.querySelectorAll('input[data-type="cookie"]:checked'),
    ].map((node) => node.value);

    navigator["privacy"].cookies = cookies;
    navigator["privacy"].collectedData = collectedData;

    document.body.classList.remove(PREFIX + "-blockScroll");
    body.remove();
    styleNode.remove();

    localStorage.setItem(
      "privacySettings",
      JSON.stringify({ cookies, collectedData }),
    );

    document.dispatchEvent(event);
  }
})();
