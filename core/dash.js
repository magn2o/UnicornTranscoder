/**
 * Created by drouar_b on 18/08/2017.
 */

const debug = require('debug')('Dash');
const Transcoder = require('./transcoder');
const universal = require('./universal');
const config = require('../utils/config');

let dash = {};

dash.serve = function (req, res) {
    debug(req.query.session);
    universal.cache[req.query.session] = new Transcoder(req.query.session, req.url, res)
};

dash.serveInit = function (req, res) {
    let sessionId = req.params.sessionId;
    debug('Requesting init for session ' + sessionId);

    if ((typeof universal.cache[sessionId]) != 'undefined' && universal.cache[sessionId].alive == true) {
        universal.cache[sessionId].getChunk('init', () => {
            debug('Serving init for session ' + sessionId);
            res.sendFile(config.xdg_cache_home + sessionId + "/init-stream" + req.params.streamId + ".m4s");

            universal.updateTimeout(sessionId);
        }, req.params.streamId);
    } else {
        debug(req.params.sessionId + ' not found');
        res.status(404).send('Session not found');
    }
};

dash.serveChunk = function (req, res) {
    let sessionId = req.params.sessionId;
    debug('Requesting ' + req.params.partId + ' for session ' + sessionId);

    if ((typeof universal.cache[sessionId]) != 'undefined' && universal.cache[sessionId].alive == true) {
        universal.cache[sessionId].getChunk(req.params.partId, () => {
            debug('Serving ' + req.params.partId + ' for session ' + sessionId);
            res.sendFile(config.xdg_cache_home + sessionId + "/chunk-stream" + req.params.streamId + "-" + req.params.partId + ".m4s");

            universal.updateTimeout(sessionId);
        }, req.params.streamId);
    } else {
        debug(req.params.sessionId + ' not found');
        res.status(404).send('Session not found');
    }
};

module.exports = dash;