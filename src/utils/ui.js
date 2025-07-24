export function btnActive(activeBtn, controlsButtons) {
  controlsButtons.forEach((btn) => {
    btn.classList.remove("active");
  });
  activeBtn.classList.add("active");
}

export function setupCloseButton(closeBtn, userInfoPanel) {
  closeBtn.onclick = () => { // closeBtn HTMLCollection bo'lgani uchun [0] kerak
    userInfoPanel.style.visibility = "hidden";
  };
}
