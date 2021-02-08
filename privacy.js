(function () {
  async function injectPrivacyModal() {
    return await new Promise((resolve) => {
      const scriptNode = document.createElement("script");
      scriptNode.type = "text/javascript";
      scriptNode.defer = true;
      scriptNode.src = "privacy.modal.js";
      document.head.appendChild(scriptNode);

      const t = setInterval(function () {
        if (typeof navigator["privacy"] !== "undefined") {
          clearInterval(t);
          resolve(true);
        }
      }, 10);
    });
  }

  async function updatePrivacy() {
    if (typeof navigator["privacy"] === "undefined") {
      await injectPrivacyModal();
    }

    let privacy = navigator["privacy"];

    let requirements = { cookies: [], collectedData: [] };

    document
      .querySelectorAll("[privacy-waiting][data-required]")
      .forEach(function (scriptNode) {
        const privacyNeeds = scriptNode.dataset.privacy
          .toLowerCase()
          .split(",")
          .map((need) => need.trim());

        const permissionsNeeds = scriptNode.dataset.collected
          .toLowerCase()
          .split(",")
          .map((need) => need.trim());

        requirements.cookies = [...requirements.cookies, privacyNeeds];
        requirements.collectedData = [
          ...requirements.collectedData,
          permissionsNeeds,
        ];

        requirements.cookies = requirements.cookies.filter(
          (need) => !navigator["privacy"].cookies.includes(need),
        );
        requirements.collectedData = requirements.collectedData.filter(
          (need) => !navigator["privacy"].collectedData.includes(need),
        );

        if (requirements.cookies.length || requirements.collectedData.length) {
          navigator["privacy"].askRequirement(
            {
              cookies: requirements.cookies,
              collectedData: requirements.collectedData,
            },
            true,
          );
        }
      });

    document
      .querySelectorAll("[privacy-waiting]")
      .forEach(function (scriptNode) {
        const privacyNeeds = scriptNode.dataset.privacy
          .toLowerCase()
          .split(",")
          .map((need) => need.trim());

        const permissionsNeeds = scriptNode.dataset.collected
          .toLowerCase()
          .split(",")
          .map((need) => need.trim());

        const isPrivacyOkay = permissionsNeeds.filter(
          (need) => !privacy.collectedData.includes(need),
        );

        const isPermissionsOkay = privacyNeeds.filter(
          (need) => !privacy.cookies.includes(need),
        );

        if (!isPrivacyOkay.length && !isPermissionsOkay.length) {
          scriptNode.src = scriptNode.dataset.src;
          scriptNode.removeAttribute("privacy-waiting");
        } else if (scriptNode.dataset["required"] !== undefined) {
          navigator["privacy"].askRequirement({
            cookies: isPrivacyOkay,
            collectedData: isPermissionsOkay,
          });
        }
      });
  }

  document.addEventListener("privacyChanged", updatePrivacy);

  updatePrivacy();
})();
