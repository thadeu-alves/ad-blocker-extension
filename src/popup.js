let blockCount = 0;
let currentDomain = "";

document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("toggle");
    const blockCountSpan =
        document.getElementById("block-count");
    const optionsBtn =
        document.getElementById("options-btn");
    const websites = document.querySelector(".websites");

    chrome.storage.local.get(
        ["adBlockEnabled"],
        (result) => {
            toggle.checked =
                result.adBlockEnabled !== false;
            updateRuleset(toggle.checked);
        }
    );

    try {
        chrome.runtime.sendMessage(
            { type: "getBlockCount" },
            (response) => {
                const { blockedSites } = response;
                console.log(response);
                blockedSites.forEach((site) => {
                    websites.innerHTML += `<h1>${site.domain}: ${site.count}</h1>`;
                });
            }
        );
    } catch (error) {
        console.error(
            "Error sending message to background script:",
            error
        );
        blockCountSpan.textContent = `${blockCount} on ${
            currentDomain || "N/A"
        }`;
    }

    toggle.addEventListener("change", () => {
        const enabled = toggle.checked;
        chrome.storage.local.set({
            adBlockEnabled: enabled,
        });
        updateRuleset(enabled);
    });

    optionsBtn.addEventListener("click", () => {
        chrome.runtime.openOptionsPage();
    });
});

function updateRuleset(enabled) {
    chrome.declarativeNetRequest.updateEnabledRulesets(
        {
            enableRulesetIds: enabled ? ["ruleset_1"] : [],
            disableRulesetIds: enabled ? [] : ["ruleset_1"],
        },
        () => {
            if (chrome.runtime.lastError) {
                console.error(
                    "Error updating ruleset:",
                    chrome.runtime.lastError.message
                );
            }
        }
    );
}
