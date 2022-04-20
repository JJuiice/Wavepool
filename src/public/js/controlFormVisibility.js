function revealActionOpts(actVal) {
  const AF_INPUT = document.querySelector("#afInput");
  const ENC_DATA_INPUT = document.querySelector("#encDataInput");
  const SUBMIT_BTN = document.querySelector("#wavepool_submit");
  if (actVal === "enc") {
    AF_INPUT.style.display = "block";
    ENC_DATA_INPUT.style.display = "block";
    SUBMIT_BTN.style.display = "block";
  } else if (actVal === "dec") {
    AF_INPUT.style.display = "block";
    ENC_DATA_INPUT.style.display = "none";
    SUBMIT_BTN.style.display = "block";
  } else {
    AF_INPUT.style.display = "none";
    ENC_DATA_INPUT.style.display = "none";
    SUBMIT_BTN.style.display = "none";
  }
}

function getSelectedAction() {
  const SELECTED_ACTION = document.querySelector("[name=action]:checked");

  if (SELECTED_ACTION === null) return null;

  return SELECTED_ACTION.value;
}

window.onload = (event) => {
  revealActionOpts(getSelectedAction());
};
