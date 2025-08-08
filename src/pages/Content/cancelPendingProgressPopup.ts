// Reference-style progress popup for cancelPendingRequests (UI matches progressPopup.tsx)
const icon128 = chrome.runtime.getURL('icon-128.png');
const FCE_CANCEL_CSS = `
#FCE_cancel_pending_model a{  
    float: right;
    color: red;
    margin:0;
    position: absolute;
    right: 10px;
    font-size: 22px;
}
#FCE_cancel_pending_model{
  position: fixed;
  top: calc(100% - 319px);
  left: 20px;
  background: #fff;
  width:250px;
  border-radius: 15px;
  z-index: 99999;
}
#FCE_cancel_pending_model div{width:100%;}
#FCE_cancel_pending_model .section{
  display: flex;
  flex-direction: column;
  height: 300px;
  background: white;
  box-shadow: 0px 10px 36px rgba(0, 0, 0, 0.130709);
  border-radius: 14px;
  font-family: Arial, Helvetica, sans-serif;
  position: relative;
  padding: 0;
}
#FCE_cancel_pending_model .icon{
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: flex-start;
  text-align: center !important;
  margin-top: 24px;
  margin-bottom: 0;
}
#FCE_cancel_pending_model .center-content{
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}
#FCE_cancel_pending_model .text{
  width: 100%;
  text-align: center !important;
  font-size: 13px !important;
  line-height: 23px;
  color: #000000;
}
#FCE_cancel_pending_model .text h3{
  font-size: 20px !important;
  padding: 0 10px !important;
  margin: 0 0 12px 0;
}
#FCE_cancel_pending_model .text h2{
  text-align: center !important;
  width: 100%;
  font-size: 32px !important;
  line-height: 36px;
  color: #388e3c;
  margin: 0 0 0 0;
}
#FCE_cancel_pending_model img{
  width: 65px !important;
  margin: 0 auto !important;
}
`;

function injectCancelPendingCSS() {
  if (!document.getElementById('FCE_cancel_pending_css')) {
    const style = document.createElement('style');
    style.id = 'FCE_cancel_pending_css';
    style.textContent = FCE_CANCEL_CSS;
    document.head.appendChild(style);
  }
}

export function mountCancelPendingPopup() {
  injectCancelPendingCSS();
  let container = document.getElementById('FCE_cancel_pending_model');
  if (!container) {
    container = document.createElement('div');
    container.id = 'FCE_cancel_pending_model';
    container.innerHTML = `
      <div class="section">
        <a id="FCE_cancel_close_btn" href="#">&times;</a>
        <div class="icon">
          <img id="FCE_cancel_icon" alt="progress" />
        </div>
        <div class="center-content">
          <div class="text">
            <h3>Pending Requests Canceled</h3>
            <h2 id="FCE_cancel_count">0</h2>
          </div>
        </div>
      </div>
    `;
    // Set the image src after innerHTML assignment
    const imgElem = container.querySelector('#FCE_cancel_icon') as HTMLImageElement | null;
    if (imgElem) imgElem.src = icon128;
    document.body.appendChild(container);
    (
      container.querySelector('#FCE_cancel_close_btn') as HTMLAnchorElement | null
    )?.addEventListener('click', (e) => {
      e.preventDefault();
      container?.remove();
    });
  }
}

export function updateCancelPendingPopup(count: number) {
  const c = document.getElementById('FCE_cancel_pending_model');
  if (!c) return;
  const countElem = c.querySelector('#FCE_cancel_count');
  if (countElem) countElem.textContent = String(count);
}

export function removeCancelPendingPopup() {
  const c = document.getElementById('FCE_cancel_pending_model');
  if (c) c.remove();
} 