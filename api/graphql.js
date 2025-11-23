// Vercel Serverless Function (Node.js) for GraphQL Proxy
const axios = require('axios');

module.exports = async (req, res) => {
    // CORS 설정 (모든 도메인 허용)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONS 요청 처리 (CORS Preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    try {
        const { query, variables } = req.body;

        // 엔트리 공식 GraphQL 엔드포인트로 요청 전달
        const response = await axios.post('https://playentry.org/graphql', {
            query: query,
            variables: variables
        }, {
            headers: {
                'Content-Type': 'application/json',
                // 서버 측에서 요청을 보내므로 클라이언트 측의 보안 제약(CSRF 등)을 우회할 수 있습니다.
            }
        });

        // 엔트리 API의 응답을 클라이언트에게 전달
        res.status(200).json(response.data);

    } catch (error) {
        console.error('API 호출 오류:', error.message);
        // axios 에러 응답이 있다면 해당 상태 코드를 사용
        const statusCode = error.response ? error.response.status : 500;
        res.status(statusCode).json({
            error: 'API 호출 실패',
            details: error.message
        });
    }
};
