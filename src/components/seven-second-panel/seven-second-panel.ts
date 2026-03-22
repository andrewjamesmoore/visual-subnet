import { getState, setState, onStateChange } from "../../state";
import * as sm from "../../subnet-math";
import css from "./seven-second-panel.module.css";

interface ChartRow {
  prefix: number;
  maskValue: number;
  magicNumber: number;
  groupSize: number;
  usableHosts: number;
}

function buildChart(): ChartRow[] {
  const rows: ChartRow[] = [];
  for (let p = 1; p <= 32; p++) {
    const maskOctets = sm.numberToOctets(sm.prefixToMask(p));
    const octetIdx = sm.interestingOctet(p) - 1;
    rows.push({
      prefix: p,
      maskValue: maskOctets[octetIdx],
      magicNumber: sm.magicNumber(p),
      groupSize: sm.magicNumber(p),
      usableHosts: sm.usableHostCount(p),
    });
  }
  return rows;
}

const CHART_ROWS = buildChart();

export class SevenSecondPanel extends HTMLElement {
  private table1Body!: HTMLElement;
  private table2Body!: HTMLElement;
  private walkthroughEl!: HTMLElement;
  private cleanup!: () => void;

  connectedCallback() {
    this.className = css.host;
    this.innerHTML = `
      <div class="${css.writeup}">
        <h3>What is the 7-Second Subnetting Method?</h3>
        <p>
          The 7-second subnetting method is a mental math shortcut that lets you
          find subnet boundaries without converting to binary. This method was created and popularized by
          <a href="https://www.professormesser.com/" target="_blank" rel="noopener noreferrer"><strong>Professor Messer</strong></a> for quickly calculating subnet boundaries during exams and certifications. It works by finding
          a <strong>magic number</strong> in the <strong>interesting octet</strong>
          and counting up from zero.
        </p>
        <ol>
          <li><strong>Find the interesting octet</strong> &mdash; the octet in the
            subnet mask that is neither 255 nor 0. This is where the subnetting
            happens.</li>
          <li><strong>Find the magic number</strong> &mdash; subtract the mask
            value in the interesting octet from 256. This gives you the size of
            each subnet block.</li>
          <li><strong>Find the network boundaries</strong> &mdash; starting from
            0, count up by the magic number in the interesting octet until you pass
            the IP address. The range you land in is your subnet.</li>
        </ol>
        <p>
          Use the reference tables below to quickly look up values, or follow the
          live walkthrough to see the method applied to your current subnet.
        </p>
      </div>

      <div class="${css.tablesSection}">
        <div class="${css.tableWrap}">
          <div class="${css.tableLabel}">Table 1 &mdash; Subnet Values (click a row to apply)</div>
          <div class="${css.chartWrap}">
            <table class="${css.chart}" data-ref="table1">
              <thead>
                <tr>
                  <th>CIDR</th>
                  <th>Subnet Mask Value</th>
                </tr>
              </thead>
              <tbody data-ref="table1-body"></tbody>
            </table>
          </div>
        </div>

        <div class="${css.tableWrap}">
          <div class="${css.tableLabel}">Table 2 &mdash; Group Size &amp; Hosts</div>
          <div class="${css.chartWrap}">
            <table class="${css.chart}" data-ref="table2">
              <thead>
                <tr>
                  <th>Group Size</th>
                  <th># Usable Hosts</th>
                  <th class="${css.subnetsCol}" data-ref="subnets-header"># Subnets</th>
                </tr>
              </thead>
              <tbody data-ref="table2-body"></tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <div class="${css.walkthroughLabel}">Live Walkthrough</div>
        <div class="${css.walkthrough}" data-ref="walkthrough"></div>
      </div>
    `;

    this.table1Body = this.ref("table1-body");
    this.table2Body = this.ref("table2-body");
    this.walkthroughEl = this.ref("walkthrough");

    this.table1Body.addEventListener("click", (e) => this.onChartClick(e));
    this.table2Body.addEventListener("click", (e) => this.onChartClick(e));

    this.renderTables();
    this.renderWalkthrough();
    this.cleanup = onStateChange(() => {
      this.renderTables();
      this.renderWalkthrough();
    });
  }

  disconnectedCallback() {
    this.cleanup?.();
  }

  private ref(name: string): HTMLElement {
    return this.querySelector(`[data-ref="${name}"]`) as HTMLElement;
  }

  private renderTables() {
    const { prefix: currentPrefix, parentPrefix } = getState();
    const hasParent = parentPrefix !== null;
    this.table1Body.innerHTML = "";
    this.table2Body.innerHTML = "";

    // Show/hide subnets column header
    const subnetsHeader = this.ref("subnets-header");
    subnetsHeader.style.display = hasParent ? "" : "none";

    let lastOctet = 0;

    for (const row of CHART_ROWS) {
      const octet = sm.interestingOctet(row.prefix);

      // Table 1: Subnet Values
      if (octet !== lastOctet) {
        const groupTr1 = document.createElement("tr");
        groupTr1.className = css.octetGroup;
        const groupTd1 = document.createElement("td");
        groupTd1.colSpan = 2;
        groupTd1.textContent = `Octet ${octet}`;
        groupTr1.appendChild(groupTd1);
        this.table1Body.appendChild(groupTr1);

        const groupTr2 = document.createElement("tr");
        groupTr2.className = css.octetGroup;
        const groupTd2 = document.createElement("td");
        groupTd2.colSpan = hasParent ? 3 : 2;
        groupTd2.textContent = `Octet ${octet}`;
        groupTr2.appendChild(groupTd2);
        this.table2Body.appendChild(groupTr2);

        lastOctet = octet;
      }

      const isActive = row.prefix === currentPrefix;

      // Table 1 row
      const tr1 = document.createElement("tr");
      if (isActive) tr1.className = css.chartRowActive;
      tr1.dataset.prefix = String(row.prefix);
      const cidrTd = document.createElement("td");
      cidrTd.textContent = `/${row.prefix}`;
      const maskTd = document.createElement("td");
      maskTd.textContent = String(row.maskValue);
      tr1.appendChild(cidrTd);
      tr1.appendChild(maskTd);
      this.table1Body.appendChild(tr1);

      // Table 2 row
      const tr2 = document.createElement("tr");
      if (isActive) tr2.className = css.chartRowActive;
      tr2.dataset.prefix = String(row.prefix);
      const groupTd = document.createElement("td");
      groupTd.textContent = row.groupSize.toLocaleString();
      const hostsTd = document.createElement("td");
      hostsTd.textContent = row.usableHosts.toLocaleString();
      tr2.appendChild(groupTd);
      tr2.appendChild(hostsTd);

      if (hasParent) {
        const subnetsTd = document.createElement("td");
        if (row.prefix > parentPrefix!) {
          subnetsTd.textContent = Math.pow(2, row.prefix - parentPrefix!).toLocaleString();
        } else if (row.prefix === parentPrefix!) {
          subnetsTd.textContent = "1";
        } else {
          subnetsTd.textContent = "\u2014";
        }
        tr2.appendChild(subnetsTd);
      }

      this.table2Body.appendChild(tr2);
    }
  }

  private renderWalkthrough() {
    const { octets, prefix } = getState();
    const ip = sm.ipToNumber(octets);
    const maskOctets = sm.numberToOctets(sm.prefixToMask(prefix));
    const octetNum = sm.interestingOctet(prefix);
    const maskVal = sm.interestingOctetMaskValue(prefix);
    const magic = sm.magicNumber(prefix);
    const maskStr = maskOctets.join(".");

    const ipOctetVal = octets[octetNum - 1];

    // Find the boundaries in the interesting octet
    let lower = 0;
    while (lower + magic <= ipOctetVal) {
      lower += magic;
    }
    const upper = lower + magic - 1;

    // Build full network and broadcast in dotted notation
    const netOctets = sm.numberToOctets(sm.networkAddress(ip, prefix));
    const bcastOctets = sm.numberToOctets(sm.broadcastAddress(ip, prefix));

    const firstHostOctets = sm.numberToOctets(sm.firstUsableHost(ip, prefix));
    const lastHostOctets = sm.numberToOctets(sm.lastUsableHost(ip, prefix));
    const usableHosts = sm.usableHostCount(prefix).toLocaleString();

    // Build octet breakdown strings for the derivation
    const octetIdx = octetNum - 1;
    const cappedUpper = Math.min(upper, 255);

    // Helper: show how each address is assembled from the octets
    const buildOctetBreakdown = (vals: number[], highlightIdx: number) => {
      return vals
        .map((v, i) => (i === highlightIdx ? `<strong>${v}</strong>` : String(v)))
        .join(".");
    };

    // Step 1: derive the mask from the prefix
    const fullOctets = Math.floor(prefix / 8);
    const partialBits = prefix % 8;

    // Build the explanation for how the mask is constructed
    const maskParts: string[] = [];
    if (fullOctets > 0) {
      maskParts.push(`${fullOctets === 1 ? "The first octet is" : `The first ${fullOctets} octets are`} all network bits, so ${fullOctets === 1 ? "it becomes" : "they become"} <strong>255</strong>`);
    }
    if (partialBits > 0) {
      maskParts.push(`octet ${fullOctets + 1} gets ${partialBits} network ${partialBits === 1 ? "bit" : "bits"} &mdash; look up <strong>/${prefix}</strong> in Table 1 to get <strong>${maskVal}</strong>`);
    }
    const zeroOctets = 4 - fullOctets - (partialBits > 0 ? 1 : 0);
    if (zeroOctets > 0) {
      maskParts.push(`the remaining ${zeroOctets === 1 ? "octet is" : `${zeroOctets} octets are`} all host bits: <strong>0</strong>`);
    }

    this.walkthroughEl.innerHTML = `
      <div class="${css.stepGoal}">
        <strong>Goal:</strong> Given <span class="${css.stepHighlight}">${octets.join(".")}/${prefix}</span>,
        find the network address, broadcast address, first usable host, and last usable host.
      </div>

      <div class="${css.step}">
        <div class="${css.stepNumber}">Step 1</div>
        <div class="${css.stepTitle}">Convert the prefix to a subnet mask</div>
        <div class="${css.stepBody}">
          A <strong>/${prefix}</strong> prefix means the first <strong>${prefix}</strong> bits are network
          and the remaining <strong>${32 - prefix}</strong> bits are host.
          Split that across four octets (8 bits each):
          ${maskParts.join("; ")}.
        </div>
        <div class="${css.stepCalc}">/${prefix} &rarr; <strong>${maskStr}</strong></div>
      </div>

      <div class="${css.step}">
        <div class="${css.stepNumber}">Step 2</div>
        <div class="${css.stepTitle}">Find the interesting octet</div>
        <div class="${css.stepBody}">
          ${maskVal > 0 && maskVal < 255
            ? `Look for the octet that is neither 255 nor 0 &mdash; that's <span class="${css.stepHighlight}">octet ${octetNum}</span> (value: <strong>${maskVal}</strong>). This is the octet where the network/host boundary falls.`
            : `The mask falls on an exact octet boundary, so the interesting octet is <span class="${css.stepHighlight}">octet ${octetNum}</span> (value: <strong>${maskVal}</strong>) &mdash; the last octet with mask bits.`}
        </div>
        <div class="${css.stepCalc}">${maskOctets.map((o, i) => (i === octetIdx ? `<strong>[${o}]</strong>` : String(o))).join(".")}</div>
      </div>

      <div class="${css.step}">
        <div class="${css.stepNumber}">Step 3</div>
        <div class="${css.stepTitle}">Find the magic number</div>
        <div class="${css.stepBody}">
          Subtract the mask value in octet ${octetNum} from 256.
          The result is the <strong>group size</strong> &mdash; how many addresses
          are in each subnet block. You can verify this in <strong>Table 1</strong>
          and <strong>Table 2</strong> above.
        </div>
        <div class="${css.stepCalc}">256 &minus; ${maskVal} = <span class="${css.stepHighlight}">${magic}</span> (group size)</div>
      </div>

      <div class="${css.step}">
        <div class="${css.stepNumber}">Step 4</div>
        <div class="${css.stepTitle}">Count by the magic number to find your range</div>
        <div class="${css.stepBody}">
          In octet ${octetNum}, start at <strong>0</strong> and count up by
          <span class="${css.stepHighlight}">${magic}</span>.
          Find the range that contains
          <strong>${ipOctetVal}</strong> (the IP's octet ${octetNum} value).
        </div>
        ${this.buildBoundaryTable(magic, ipOctetVal)}
        <div class="${css.stepBody}">
          Octet ${octetNum} of our IP (<strong>${ipOctetVal}</strong>) falls in the range
          <span class="${css.stepHighlight}">${lower}</span> &ndash;
          <span class="${css.stepHighlight}">${cappedUpper}</span>.
        </div>
      </div>

      <div class="${css.step}">
        <div class="${css.stepNumber}">Step 5</div>
        <div class="${css.stepTitle}">Build the network address</div>
        <div class="${css.stepBody}">
          Take the <strong>start</strong> of the range (<strong>${lower}</strong>) and place it in octet ${octetNum}.
          Octets before it stay the same as the IP. Octets after it become <strong>0</strong>.
        </div>
        <div class="${css.stepCalc}">${buildOctetBreakdown(netOctets, octetIdx)}</div>
      </div>

      <div class="${css.step}">
        <div class="${css.stepNumber}">Step 6</div>
        <div class="${css.stepTitle}">Build the broadcast address</div>
        <div class="${css.stepBody}">
          Take the <strong>end</strong> of the range (<strong>${cappedUpper}</strong>) and place it in octet ${octetNum}.
          Octets before it stay the same. Octets after it become <strong>255</strong>.
        </div>
        <div class="${css.stepCalc}">${buildOctetBreakdown(bcastOctets, octetIdx)}</div>
      </div>

      <div class="${css.step}">
        <div class="${css.stepNumber}">Step 7</div>
        <div class="${css.stepTitle}">Find the usable host range</div>
        <div class="${css.stepBody}">
          The <strong>first usable host</strong> is the network address + 1.
          The <strong>last usable host</strong> is the broadcast address &minus; 1.
        </div>
        <div class="${css.stepCalc}">
          First host: ${netOctets.join(".")} + 1 = <strong>${firstHostOctets.join(".")}</strong><br>
          Last host: ${bcastOctets.join(".")} &minus; 1 = <strong>${lastHostOctets.join(".")}</strong>
        </div>
      </div>

      <div class="${css.stepResult}">
        <div class="${css.stepResultTitle}">Answer</div>
        <table class="${css.resultTable}">
          <tr><td>Network Address</td><td><strong>${netOctets.join(".")}</strong></td></tr>
          <tr><td>First Usable Host</td><td><strong>${firstHostOctets.join(".")}</strong></td></tr>
          <tr><td>Last Usable Host</td><td><strong>${lastHostOctets.join(".")}</strong></td></tr>
          <tr><td>Broadcast Address</td><td><strong>${bcastOctets.join(".")}</strong></td></tr>
          <tr><td>Usable Hosts</td><td><strong>${usableHosts}</strong></td></tr>
        </table>
      </div>
    `;
  }

  private buildBoundaryTable(magic: number, target: number): string {
    const rows: string[] = [];
    let n = 0;
    const max = 12; // show at most 12 rows to keep it compact
    let matched = false;

    while (n < 256 && rows.length < max) {
      const end = Math.min(n + magic - 1, 255);
      const isMatch = target >= n && target <= end;
      if (isMatch) matched = true;

      const rowClass = isMatch ? css.boundaryRowActive : "";
      const arrow = isMatch ? `<span class="${css.boundaryArrow}">&larr; ${target}</span>` : "";
      rows.push(
        `<tr class="${rowClass}"><td>${n}</td><td>&ndash;</td><td>${end}</td><td>${arrow}</td></tr>`
      );

      n += magic;
    }

    if (!matched && n < 256) {
      rows.push(`<tr><td colspan="4">…</td></tr>`);
    }

    return `
      <table class="${css.boundaryTable}">
        <thead><tr><th>Start</th><th></th><th>End</th><th></th></tr></thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    `;
  }

  private onChartClick(e: MouseEvent) {
    const tr = (e.target as HTMLElement).closest("tr");
    if (!tr || !tr.dataset.prefix) return;
    setState({ prefix: parseInt(tr.dataset.prefix, 10) });
  }
}
