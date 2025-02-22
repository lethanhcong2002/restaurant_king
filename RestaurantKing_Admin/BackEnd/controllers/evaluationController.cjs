const { db, bucket } = require('../firebaseConfig.cjs');

const getEvaluations = async (req, res) => {
    try {
        const evaluationsRef = db.collection('evaluation');
        const snapshot = await evaluationsRef.get();

        if (snapshot.empty) {
            console.log('No matching documents.');
            return res.status(200).json({ data: [] });
        }

        const evaluations = [];
        snapshot.forEach(doc => {
            evaluations.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return res.status(200).json({ data: evaluations });
    } catch (error) {
        console.error('Error fetching evaluations: ', error);
        return res.status(500).json({ error: 'Failed to fetch evaluations' });
    }
};


module.exports = { getEvaluations };
