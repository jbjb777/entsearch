document.getElementById('search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const searchTerm = document.getElementById('search-input').value.trim();
    if (searchTerm) {
        searchEntryUsers(searchTerm);
    }
});

function searchEntryUsers(term) {
    const resultsContainer = document.getElementById('user-results');
    resultsContainer.innerHTML = '<div>검색 중...</div>';

    // --- 중요: API 호출 관련 정보 ---
    // 엔트리 공식 API 엔드포인트는 'https://playentry.org/graphql' 입니다.
    // 하지만, 이 API는 CSRF 방지 등의 보안 메커니즘으로 인해 클라이언트(브라우저)에서
    // 직접 호출하는 것이 차단됩니다. (CORS 오류 또는 "form tampered with" 응답)
    // 실제 작동을 위해서는 반드시 서버 측 프록시를 통해 호출해야 합니다.
    // 아래 코드는 API 호출의 형태만 보여주며, 실제로는 작동하지 않습니다.
    // ---------------------------------

    const graphqlQuery = {
        query: `
            query SELECT_USERS($term: String, $limit: Int, $offset: Int) {
                SELECT_USERS(term: $term, limit: $limit, offset: $offset) {
                    _id
                    username
                    description
                    profileImage
                }
            }
        `,
        variables: {
            term: term,
            limit: 10, // 최대 10명의 사용자 검색
            offset: 0
        }
    };

    // Vercel 프록시 엔드포인트를 호출하는 실제 API 호출 코드
    fetch('/api/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphqlQuery)
    })
    .then(response => response.json())
    .then(data => {
        if (data.data && data.data.SELECT_USERS) {
            displayResults(data.data.SELECT_USERS);
        } else {
            resultsContainer.innerHTML = '<div>검색 결과가 없습니다.</div>';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        resultsContainer.innerHTML = '<div>검색 중 오류가 발생했습니다. 프록시 서버를 확인하세요.</div>';
    });
}

function displayResults(users) {
    const resultsContainer = document.getElementById('user-results');
    resultsContainer.innerHTML = '';

    if (users.length === 0) {
        resultsContainer.innerHTML = '<div>검색 결과가 없습니다.</div>';
        return;
    }

    users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'user-card';

        const avatar = document.createElement('img');
        avatar.className = 'user-avatar';
        // 프로필 이미지가 없을 경우 기본 이미지 사용
        avatar.src = user.profileImage || 'https://playentry.org/img/default_profile.png';
        avatar.alt = user.username + ' 프로필';

        const info = document.createElement('div');
        info.className = 'user-info';

        const username = document.createElement('strong');
        username.textContent = user.username;

        const description = document.createElement('span');
        description.textContent = user.description || '소개 없음';

        info.appendChild(username);
        info.appendChild(description);

        card.appendChild(avatar);
        card.appendChild(info);

        resultsContainer.appendChild(card);
    });
}
