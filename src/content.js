"use strict";
const popupContainer = document.getElementsByTagName("ytd-popup-container")[0];
const observerOptions = {
    childList: true,
    attributes: true,
    subtree: true
};

// const extractHashTag = (str) => {
//     const regexp = /\#[ぁ-んァ-ヶｱ-ﾝﾞﾟ一-龠0-9a-zA-Z]*/g;
//     const hashTags = [...str.matchAll(regexp)];
//     return hashTags;
// }
const generateNoteWord = () => {
    try {
        // HACK: 本当はmeta titleから取ってきたいがyoutubeのバグでひとつ前に見てた動画のmeta tagから更新されてないことがある
        // #があるとmisskey側がうまく調整できないので一旦#を消してしまう
        const title = document.title.replace(/\(.*\)/, "").split(" - ")[0].replaceAll("\#", "");
        const searchParams = new URLSearchParams(window.location.search);
        const videoHash = searchParams.get("v");
        // HACK: 実際のyoutubeのシェア機能だとyoutube liveの時はyoutube.com/liveを使ってそうだが区別するのも面倒だし全部短縮URL/videoHashでリンクしてそう
        const url = `https://youtu.be/${videoHash}`;
        return {
            title,
            url,
        };
    } catch (error) {
        console.log(error);
    }
}
const addMisskeyShareButton = (observer) => {
    // 要素を加えることでmutationObserverが無限ループするので追加の処理中はdisconnectする
    observer.disconnect()
    const shareButtonList = document.querySelector("div #list .yt-third-party-share-target-section-renderer");
    const isVisibleShareMenuDialog = !document.getElementsByTagName("tp-yt-paper-dialog").ariaHidden;
    const renderedMisskeyShareButton = document.querySelector(".misskey-share-button");
    if(!isVisibleShareMenuDialog || renderedMisskeyShareButton)  {
        observer.observe(popupContainer, observerOptions)
        return;
    }
    if (shareButtonList) {
        const misskeyShareButton = document.createElement("button");
        misskeyShareButton.className = "misskey-share-button";
        const misskeyIcon = document.createElement("img");
        misskeyIcon.className = "misskey-icon";
        misskeyIcon.src = "https://raw.githubusercontent.com/misskey-dev/assets/main/icon.png";
        misskeyShareButton.appendChild(misskeyIcon);
        const misskeyShareButtonTitle = document.createElement("div");
        misskeyShareButtonTitle.className = "misskey-share-button-title";
        misskeyShareButtonTitle.textContent = "misskey";
        misskeyShareButton.appendChild(misskeyIcon);
        misskeyShareButton.appendChild(misskeyShareButtonTitle);
        const words = generateNoteWord();
        misskeyShareButton.onclick = () => {
            window.open("https://misskey.io/share" + `?text=${words.title}&url=${words.url}`, "_blank");
        }
        const baseChild = document.getElementsByTagName("yt-share-target-renderer")[1];
        baseChild.parentNode.insertBefore(misskeyShareButton, baseChild);
    }
    observer.observe(popupContainer, observerOptions)
}
const main = () => {
    const observer = new MutationObserver(() => {
        addMisskeyShareButton(observer)
    });
    observer.observe(popupContainer, observerOptions);
}
main()