// ==UserScript==
// @name         JS Mapper & Blocker (Domain-Specific + Auto Log)
// @namespace    custom-js-tracker
// @version      1.4
// @description  Map and block JS files per site. Logs auto-blocked scripts. Persistent per domain.
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const domainKey = () => `__jsblocker__${location.hostname}`;
    const getDomainBlockList = () => JSON.parse(localStorage.getItem(domainKey()) || '[]');
    const setDomainBlockList = list => localStorage.setItem(domainKey(), JSON.stringify(list));

    window.jsBlockList = getDomainBlockList();
    window.latestScriptList = [];

    function mapAndListJS() {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const activeScripts = scripts
            .filter(s => !window.jsBlockList.includes(s.src))
            .map(s => s.src);

        console.log('Website:', location.hostname);
        activeScripts.forEach((src, i) => {
            console.log(`[${i + 1}] ${src}`);
        });

        window.latestScriptList = activeScripts;
    }

    function blockJSByNumber(no) {
        const index = Number(no) - 1;
        const srcToBlock = window.latestScriptList?.[index];

        if (!srcToBlock) {
            console.warn('Invalid number or list not initialized. Run mapAndListJS() first.');
            return;
        }

        if (!window.jsBlockList.includes(srcToBlock)) {
            window.jsBlockList.push(srcToBlock);
            setDomainBlockList(window.jsBlockList);
        }

        const existing = document.querySelectorAll(`script[src="${srcToBlock}"]`);
        existing.forEach(el => el.remove());

        console.log(`Blocked: ${srcToBlock}`);
        mapAndListJS();
    }

    function blockJSByNumbers(numbers) {
        if (!Array.isArray(numbers)) {
            console.warn('Argument must be an array of numbers.');
            return;
        }

        numbers.forEach(n => {
            if (typeof n === 'number') {
                blockJSByNumber(n);
            }
        });
    }

    // Hook: Prevent and log future script injection attempts
    const originalAppend = Element.prototype.appendChild;
    Element.prototype.appendChild = function (child) {
        if (
            child.tagName === 'SCRIPT' &&
            child.src &&
            window.jsBlockList.includes(child.src)
        ) {
            console.log(`%c[Auto-Blocked] ${child.src}`, 'color: red; font-weight: bold;');
            return child;
        }
        return originalAppend.call(this, child);
    };

    function logInstructions() {
        console.log('%c[JS Mapper & Blocker (Auto Log Enabled)]', 'color: cyan; font-weight: bold;');
        console.log('%cCommands:', 'color: yellow; font-weight: bold;');
        console.log('> mapAndListJS()             // Lists all external JS files on the page');
        console.log('> blockJSByNumber(N)         // Blocks JS file [N]');
        console.log('> blockJSByNumbers([1,2,3])  // Blocks multiple JS files');
    }

    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            mapAndListJS();
            logInstructions();
        }, 0);
    });

    window.mapAndListJS = mapAndListJS;
    window.blockJSByNumber = blockJSByNumber;
    window.blockJSByNumbers = blockJSByNumbers;
})();

// Some reason occur and the usage and js loaded doesnt show so i add this

function showJSList() {
    const current = localStorage.getItem('jsBlocker_mappedList_' + location.hostname);
    if (!current) {
        console.log('[JS Mapper] No JS list found for this domain.');
        return;
    }
    const list = JSON.parse(current);
    console.log(`Website: ${location.hostname}`);
    list.forEach((url, i) => console.log(`[${i + 1}] ${url}`));
}
