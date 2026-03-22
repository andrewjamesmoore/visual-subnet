import "@material/web/divider/divider";
import "@material/web/tabs/tabs";
import "@material/web/tabs/primary-tab";
import css from "./subnet-app.module.css";

export class SubnetApp extends HTMLElement {
  connectedCallback() {
    this.className = css.host;
    this.innerHTML = `
      <div class="${css.header}">
        <div>
          <h1 class="${css.title}"><span class="${css.titleAccent}">Visual Subnetting</span></h1>
          <p class="${css.subtitle}">A visual, interactive subnet calculator</p>
        </div>
        <a class="${css.githubLink}" href="#" target="_blank" rel="noopener noreferrer" aria-label="View on GitHub">
          <svg class="${css.githubIcon}" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        </a>
      </div>

      <div class="${css.card}">
        <md-tabs data-ref="tabs">
          <md-primary-tab data-ref="tab-ipv4" aria-controls="panel-ipv4">IPv4 Calculator</md-primary-tab>
          <md-primary-tab data-ref="tab-ipv6" aria-controls="panel-ipv6">IPv6 Calculator</md-primary-tab>
          <md-primary-tab data-ref="tab-7sec" aria-controls="panel-7sec">7-Second Method</md-primary-tab>
        </md-tabs>

        <div class="${css.tabPanels}">
          <div id="panel-ipv4" class="${css.tabPanel} ${css.tabPanelActive}" role="tabpanel" data-ref="panel-ipv4">
            <div class="${css.section}">
              <ip-input></ip-input>
            </div>

            <md-divider></md-divider>

            <div class="${css.section} ${css.dividerGap}">
              <div class="${css.sectionTitle}">Bit Allocation</div>
              <bit-bar></bit-bar>
            </div>

            <md-divider></md-divider>

            <div class="${css.section} ${css.dividerGap}">
              <div class="${css.sectionTitle}">Subnet Details</div>
              <stats-panel></stats-panel>
            </div>

            <md-divider></md-divider>

            <div class="${css.section} ${css.dividerGap}">
              <binary-panel></binary-panel>
            </div>
          </div>

          <div id="panel-ipv6" class="${css.tabPanel}" role="tabpanel" data-ref="panel-ipv6" hidden>
            <div class="${css.section}">
              <ipv6-input></ipv6-input>
            </div>

            <md-divider></md-divider>

            <div class="${css.section} ${css.dividerGap}">
              <div class="${css.sectionTitle}">Prefix / Interface ID Split</div>
              <ipv6-bit-bar></ipv6-bit-bar>
            </div>

            <md-divider></md-divider>

            <div class="${css.section} ${css.dividerGap}">
              <div class="${css.sectionTitle}">IPv6 Details</div>
              <ipv6-stats-panel></ipv6-stats-panel>
            </div>

            <md-divider></md-divider>

            <div class="${css.section} ${css.dividerGap}">
              <ipv6-binary-panel></ipv6-binary-panel>
            </div>
          </div>

          <div id="panel-7sec" class="${css.tabPanel}" role="tabpanel" data-ref="panel-7sec" hidden>
            <div class="${css.section}">
              <ip-input></ip-input>
            </div>

            <md-divider></md-divider>

            <div class="${css.section} ${css.dividerGap}">
              <seven-second-panel></seven-second-panel>
            </div>
          </div>
        </div>
      </div>
    `;

    const tabs = this.ref("tabs");
    const panels = [
      this.ref("panel-ipv4"),
      this.ref("panel-ipv6"),
      this.ref("panel-7sec"),
    ];

    tabs.addEventListener("change", () => {
      const activeIndex = (tabs as unknown as { activeTabIndex: number })
        .activeTabIndex;
      for (let i = 0; i < panels.length; i++) {
        const isActive = i === activeIndex;
        panels[i].hidden = !isActive;
        panels[i].classList.toggle(css.tabPanelActive, isActive);
      }
    });
  }

  private ref(name: string): HTMLElement {
    return this.querySelector(`[data-ref="${name}"]`) as HTMLElement;
  }
}
