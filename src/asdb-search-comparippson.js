import { customElement, property, internalProperty, LitElement, html, css } from 'lit-element';

@customElement('asdb-search-comparippson')
export class AsdbSearchComparippson extends LitElement {

    @property({type: String, reflect: true})
    name = "";

    @property({type: String, reflect: true})
    sequence = "";

    @internalProperty({type: String})
    state = "input";

    @internalProperty({type: String})
    error = "";

    @internalProperty({type: Array})
    results = [];

    static get styles() {
        return css`
        .hidden {
            display: none;
        }
        .container {
            width: 80%;
            margin: 0 auto;
        }
        .form {
            display: flex;
            flex-direction: column;
        }
        .form label {
            margin: 0.5em 0 0.25em 0;
            color: #333;
            font-weight: bold;
        }
        .form-control {
            text-align: right;
            margin-bottom: 0;
            padding-top: 7px;
            padding-right: 0.5em;
            font-weight: bold;
        }
        .expression {
            width: 80%;
        }
        .button-group {
            display: flex;
            justify-content: flex-end;
            margin-top: 2em;
        }
        button, .btn {
            display: inline-block;
            width: auto;
            touch-action: manipulation;
            cursor: pointer;
            border: 1px solid #ccc;
            padding: 6px 12px;
            font-size: 14px;
            border-radius: 4px;
            background-image: linear-gradient(to bottom, #ddd 0, #bebebe 100%);
            background-repeat: repeat-x;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.05),0 1px 0 rgba(255,255,255,0.1);
        }
        button:hover, .btn:hover {
            box-shadow: inset 0 1px 5px rgba(0,0,0,0.05),0 1px 0 rgba(255,255,255,0.1);
        }
        button:active, .btn.active {
            background-color: #bebebe;
            background-position: 0 -15px;
            border-color: #b9b9b9;
            z-index: 2;
            background-image: none;
        }
        button::-moz-focus-inner {
            padding: 0;
            border: 0;
        }
        button:disabled {
            cursor: not-allowed;
        }
        .btn-group {
            display: flex;
            justify-content: center;
        }
        .btn-group > .btn {
            border-radius: 4px;
        }
        .btn-group > .btn:first-child:not(:last-child) {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }
        .btn-group > .btn:last-child:not(:first-child) {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }
        .btn-group > .btn:not(:first-child):not(:last-child) {
            border-radius: 0;
        }
        .btn-primary {
            color: #fff;
            background-image: linear-gradient(to bottom, #810e15 0, #4a080c 100%);
            background-repeat: repeat-x;
            stroke: #fff;
            fill: #fff;
        }
        .btn-primary:hover {
            background-color: #4a080c;
        }
        .btn-primary:disabled {
            color: #bbb;
            background-color: #4a080c;
        }
        .btn-info {
            color: #fff;
            background-image: linear-gradient(to bottom, #5bc0de 0, #2aabd2 100%);
            background-repeat: repeat-x;
            stroke: #fff;
            fill: #fff;
            border-color: #28a4c9;
        }
        .btn-info:hover {
            background-color: #2aabd2;
        }
        .btn-info.active {
            background-color: #2aabd2;
            background-position: 0 -15px;
            border-color: #28a4c9;
        }
        .search {
            width: 25%;
        }
        .example {
            margin-left: 25%;
        }
    `;
    }

    nameChanged(ev) {
        this.name = ev.target.value;
    }

    sequenceChanged(ev) {
        this.sequence = ev.target.value;
    }

    newSearch() {
        this.name = "";
        this.sequence = "";
        this.state = "input";
    }

    isValidSearch() {
        return this.name.length > 0 && this.sequence.length > 0;
    }

    async runSearch() {
        this.state = "searching";

        let request = {
            name: this.name,
            sequence: this.sequence,
        };

        let result = await fetch("/api/v1.0/comparippson", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        if (!result.ok) {
            this.state = "error";
            this.error = `Network request returned ${result.status}:${result.statusText}`;
            return;
        }

        let jobInfo = await result.json();

        let nextUrl = jobInfo.next;

        let intervalId = setInterval(async() => {
            result = await fetch(nextUrl);
            if (!result.ok) {
                clearInterval(intervalId);
                this.state = error;
                this.error = `Network request returned ${result.status}:${result.statusText}`;
            }

            let data = await result.json();

            if (data.status == "pending" || data.status == "running") {
                nextUrl = data.next;
                return;
            }

            if (data.status == "failed") {
                clearInterval(intervalId);
                this.state = "error";
                return;
            }

            clearInterval(intervalId);
            this.results = data.results.hits;
            console.log(data, this.results);
            this.state = "done";
        }, 1000);

    }

    loadExample() {
        this.name = "nisin A";
        this.sequence = "ITSISLCTPGCKTGALMGCNMKTATCHCSIHVSK";
    }

    generateRow(hit) {
        return html`
        <tr>
            <td>${hit.q_acc}</td>
            <td>${hit.s_locus}</td>
            <td>${hit.identity}</td>
            <td>${hit.s_acc}</td>
            <td>${hit.s_type}</td>
        </tr>
        `;
    }

    renderResults() {
        if (this.results?.length) {
            return html`
            <table>
                <thead>
                    <tr>
                        <th>Query</th>
                        <th>Hit ID</th>
                        <th>% Identity</th>
                        <th>Hit Record</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                ${this.results.map(hit => this.generateRow(hit))}
                </tbody>
            </table>
        `;
        }
        return html`Your search gave no results. Please change your search terms and try again.`;
    }

    render() {
        return html`
<div class="container ${this.state == 'input'?'':'hidden'}">
    <div class="form">
        <label for="search-name">Name your search</label>
        <input id="search-name" class="expression" type="text"
         placeholder="query id" .value="${this.name}" @change="${this.nameChanged}">

        <label for="search-seq">Core peptide protein sequence</label>
        <input id="search-seq" class="expression" maxlength="100"
         placeholder="ITSISLCTPGCK..." .value="${this.sequence}"
         @change="${this.sequenceChanged}">
    </div>
    <div class="button-group">
        <button class="search btn-primary" @click=${this.runSearch} ?disabled="${!this.isValidSearch()}">Search</button>
        <button class="example" @click=${this.loadExample}>Load example</button>
    </div>
</div>
<div class="container ${this.state == 'searching'?'':'hidden'}">
    Running search, please wait...
</div>
<div class="container ${this.state == 'done'?'':'hidden'}">
    ${this.renderResults()}
    <div class="button-group">
        <button class="search btn-primary" @click=${this.newSearch}>New search</button>
    </div>
</div>
<div class="container ${this.state == 'error'?'':'hidden'}">
    ${this.error}
    <div class="button-group">
        <button class="search btn-primary" @click=${this.newSearch}>New search</button>
    </div>
</div>
    `;
    }
}
