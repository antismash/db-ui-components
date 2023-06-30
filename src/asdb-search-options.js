import { customElement, property, LitElement, html, css } from 'lit-element';

@customElement('asdb-search-options')
export class AsdbSearchOptions extends LitElement {
    @property({type: String, reflect: true})
    active = "comparippson";

    static get styles() {
        return css`
        a {
            text-decoration: none;
            color: #810e15;
        }
        ul {
            list-style: none;
            display: flex;
        }
        li {
            flex-grow: 1;
            display: flex;
            justify-content: center;
        }
        li a {
            flex-grow: 1;
            text-align: center;
            padding: 10px 15px;
            border-radius: 4px;
        }
        .active {
            background-color: #810e15;
            color: #fff;
        }
    `;
    }

    isActive(item) {
        if (item == this.active) {
            return "active";
        }
        return "";
    }

    render() {
        return html`
        <ul>
            <li><a class="${this.isActive('comparippson')}" href="/search_comparippson.html">Search for RiPP precursors</a></li>
            <li><a class="${this.isActive('clusterblast')}" href="/search_clusterblast.html">Search for protein sequences in annotated regions</a></li>
        </ul>
    `;
    }
}
