'use strict';

module.exports = (app, db) => {
    app.route('/api/*')
        .get(abort404);

    app.route('*')
        .get((req, res) => {
            res.sendFile(process.cwd() + '/public/index.html');
        });
};

function abort404(req, res) {
    res.status(404);
    res.end();
}
