document.addEventListener('DOMContentLoaded', function () {
    const ipAddressInput = document.getElementById('ipAddress');
    const form = document.getElementById('ipLookupForm');
    const resultsDiv = document.getElementById('results');
    
    ipAddressInput.focus();
    getCurrentTab().then(tab => {
        const url = new URL(tab.url);
        const domain = url.hostname;
        ipAddressInput.value = domain;
    }).catch(error => {
        console.error("탭 정보를 가져오는 데 실패했습니다:", error.message);
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const ipAddress = ipAddressInput.value;
        if (!ipAddress) {
            resultsDiv.innerHTML = '<div class="alert alert-danger" role="alert">IP 주소를 입력해주세요.</div>';
            return;
        }

        fetch(`https://ip-api.winsub.kr/v1/${ipAddress}`)
            .then(response => response.json())
            .then(data => {
                if (data.STATUS !== 'OK') {
                    throw new Error(data.MSG);
                }
                displayResults(data);
            })
            .catch(error => {
                resultsDiv.innerHTML = `<div class="alert alert-danger" role="alert">에러: ${error.message}</div>`;
            });
    });

    function displayResults(data) {
        const translateKO = data.DATA.TRANSLATE_KO;
        const translateEN = data.DATA.ORIGINAL;
        const resultsHTML = `
            <table class="uk-table uk-table-divider uk-table-striped uk-table-small">
                <tbody>
                    <tr><td>IP</td><td>${data.DATA.IP}</td></tr>
                    <tr><td>Continent</td><td>${translateEN.CONTINENT || '-'} <small>(${translateKO.CONTINENT || '-'})</small></td></tr>
                    <tr><td>Country</td><td>${translateEN.COUNTRY || '-'} <small>(${translateKO.COUNTRY || '-'})</small></td></tr>
                    <tr><td>Region</td><td>${translateEN.REGIONNAME || '-'}  - ${data.DATA.REGION_CODE || '-'} <small>(${translateKO.REGIONNAME || '-'})</small></td></tr>
                    <tr><td>City</td><td>${translateEN.CITY || '-'} <small>(${translateKO.CITY || '-'})</small></td></tr>
                    <tr><td>ISP</td><td>${translateEN.ISP || '-'} <small>(${translateKO.ISP || '-'})</small></td></tr>
                    <tr><td>ORG</td><td>${translateEN.ORG || '-'} <small>(${translateKO.ORG || '-'})</small></td></tr>
                    <tr><td>AS</td><td>${data.DATA.AS || '-'}<br>${data.DATA.ASNAME || '-'}</td></tr>
                </tbody>
            </table><pre>${JSON.stringify(data, null, 2)}</pre>`;
        resultsDiv.innerHTML = resultsHTML;
    }
    
    function getCurrentTab() {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                if (tabs.length === 0) {
                    reject(new Error('현재 탭을 찾을 수 없습니다.'));
                } else {
                    resolve(tabs[0]);
                }
            });
        });
    }
});
