let blockedSites = [];

chrome.storage.local.get(["blockedSites"], (result) => {
    blockedSites = result.blockedSites || [];
});

chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(
    (info) => {
        const url = info.request.url;
        if (
            !url.startsWith("http://") &&
            !url.startsWith("https://")
        ) {
            console.warn("Skipping non-http(s) URL:", url);
            return;
        }

        let domain;
        try {
            domain = new URL(url).hostname;
            if (!domain) {
                console.warn("No hostname for URL:", url);
                return;
            }
        } catch (e) {
            console.warn(
                "Invalid URL for blocked request:",
                url
            );
            return;
        }

        let siteIndex = blockedSites.findIndex(
            (site) => site.domain === domain
        );

        if (siteIndex !== -1) {
            blockedSites[siteIndex].count += 1;
        } else {
            blockedSites.push({
                domain: domain,
                count: 1,
            });
        }

        chrome.storage.local.set(
            { blockedSites: blockedSites },
            () => {
                if (chrome.runtime.lastError) {
                    console.error(
                        "Error saving blocked sites:",
                        chrome.runtime.lastError.message
                    );
                }
            }
        );
    }
);

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message.type === "getBlockCount") {
            chrome.tabs.query(
                { active: true, currentWindow: true },
                (tabs) => {
                    if (tabs[0]) {
                        const url = tabs[0].url;
                        if (
                            !url.startsWith("http://") &&
                            !url.startsWith("https://")
                        ) {
                            console.warn(
                                "Non-http(s) tab URL:",
                                url
                            );
                            sendResponse({
                                blockedSites: blockedSites,
                                domain: "N/A",
                            });
                            return;
                        }

                        let domain;
                        try {
                            domain = new URL(url).hostname;
                            if (!domain) {
                                console.warn(
                                    "No hostname for tab URL:",
                                    url
                                );
                                sendResponse({
                                    blockedSites:
                                        blockedSites,
                                    domain: "N/A",
                                });
                                return;
                            }
                        } catch (e) {
                            console.warn(
                                "Invalid URL for active tab:",
                                url
                            );
                            sendResponse({
                                blockedSites: blockedSites,
                                domain: "N/A",
                            });
                            return;
                        }

                        console.log(
                            `Sending blockedSites for ${domain}:`,
                            blockedSites
                        );
                        sendResponse({
                            blockedSites: blockedSites,
                            domain: domain,
                        });
                    } else {
                        console.warn("No active tab found");
                        sendResponse({
                            blockedSites: blockedSites,
                            domain: "N/A",
                        });
                    }
                }
            );
            return true;
        }
    }
);
