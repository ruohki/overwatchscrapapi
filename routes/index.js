"use strict";

var express = require('express');
var router = express.Router();
var cheerio = require('cheerio');
var request = require('request-promise');

const platforms = ['pc', 'psn', 'xbl'];
const regions = ['kr', 'us', 'eu'];

/* GET home page. */


router.get('/search/:name', function(req, res, next) {
  let name = req.params.name;
  
  request(`https://playoverwatch.com/en-en/search/account-by-name/${name}`)
    .then(function (content) {
        let results = JSON.parse(content);
        
        results.map((e) => {
          let parts = e.careerLink.split('/');
          
          e.platform = parts[2];
          
          if (parts[2] == 'pc') {
            e.region = parts[3];
          }              
          
          delete (e.careerLink);
        });
         
        return res.json({success: true, results});
    })
    .catch(function (err) {
        return res.json({success: false, error: err});
    });
});



router.get('/details/:platform/:region/:battle_tag', function(req, res, next) {
  let platform = req.params.platform;
  if (platforms.indexOf(platform) < 0)
    return res.json({success: false, error: "Invalid platform."});
    
  let region = req.params.region;
  if (regions.indexOf(region) < 0)
    return res.json({success: false, error: "Invalid region."});
    
  let battle_tag = req.params.battle_tag || '';
  
  /*
    The BattleTag must be between 3-12 characters long.
    Accented characters are allowed.
    Numbers are allowed, but a BattleTag cannot start with a number.
    Mixed capitals are allowed (ex: ZeRgRuSh).
    No spaces or symbols are allowed.
    The BattleTag must not break the rules established in our in-game and forum violations article.
  */
  let validator = /(^[^0-9][[A-Za-z\xC0-\uFFFF]{2,11}\-\d{4,5})/;
  if (battle_tag.match(validator) === null)
    return res.json({success: false, error: "Malformed battletag please use the following pattern: johndoe-1234."});
  
  var options = {
    uri: `https://playoverwatch.com/en-en/career/${platform}/${region}/${battle_tag}`,
    transform: function (body) {
        return cheerio.load(body);
    }
  };
  request(options)
    .then(function ($) {
      //Let the scraping begin =)
      var response = {
        playername: $('#overview-section > div > div.page-wrapper.row.content-box > div > div > div.masthead-player > h1').text(),
        quickplay: {
          combat: {
            'melee-final-blows': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(1) > div > table > tbody > tr:nth-child(1) > td:nth-child(2)').text(),
            'solo-kills': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(1) > div > table > tbody > tr:nth-child(2) > td:nth-child(2)').text(),
            'objective-kills': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(1) > div > table > tbody > tr:nth-child(3) > td:nth-child(2)').text(),
            'final-blows': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(1) > div > table > tbody > tr:nth-child(4) > td:nth-child(2)').text(),
            'damage-done': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(1) > div > table > tbody > tr:nth-child(5) > td:nth-child(2)').text(),
            'eleminations': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(1) > div > table > tbody > tr:nth-child(6) > td:nth-child(2)').text(),
            'environmental-kills': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(1) > div > table > tbody > tr:nth-child(7) > td:nth-child(2)').text(),
            'multikills': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(1) > div > table > tbody > tr:nth-child(8) > td:nth-child(2)').text()
          },
          assists: {
            'healing-done': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(2) > div > table > tbody > tr:nth-child(1) > td:nth-child(2)').text(),
            'recon-assist': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(2) > div > table > tbody > tr:nth-child(2) > td:nth-child(2)').text(),
            'teleporter-pads-destroyed': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(2) > div > table > tbody > tr:nth-child(3) > td:nth-child(2)').text()
          },
          best: {
            'eleminations': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(3) > div > table > tbody > tr:nth-child(1) > td:nth-child(2)').text(),
            'final-blows': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(3) > div > table > tbody > tr:nth-child(2) > td:nth-child(2)').text(),
            'damage-done': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(3) > div > table > tbody > tr:nth-child(3) > td:nth-child(2)').text(),
            'healing-done': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(3) > div > table > tbody > tr:nth-child(4) > td:nth-child(2)').text(),
            'defensive-assists': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(3) > div > table > tbody > tr:nth-child(5) > td:nth-child(2)').text(),
            'offensive-assists': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(3) > div > table > tbody > tr:nth-child(6) > td:nth-child(2)').text(),
            'objective-kills': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(3) > div > table > tbody > tr:nth-child(7) > td:nth-child(2)').text(),
            'objective-time': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(3) > div > table > tbody > tr:nth-child(8) > td:nth-child(2)').text(),
            'multikill': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(3) > div > table > tbody > tr:nth-child(9) > td:nth-child(2)').text(),
            'solo-kills': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(3) > div > table > tbody > tr:nth-child(10) > td:nth-child(2)').text(),
            'on-fire': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(3) > div > table > tbody > tr:nth-child(11) > td:nth-child(2)').text()
          },
          average: {
            'melee-final-blows': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(4) > div > table > tbody > tr:nth-child(1) > td:nth-child(2)').text(),
            'on-fire': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(4) > div > table > tbody > tr:nth-child(3) > td:nth-child(2)').text(),
            'solo-kills': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(4) > div > table > tbody > tr:nth-child(4) > td:nth-child(2)').text(),
            'objective-time': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(4) > div > table > tbody > tr:nth-child(5) > td:nth-child(2)').text(),
            'objective-kills': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(4) > div > table > tbody > tr:nth-child(6) > td:nth-child(2)').text(),
            'healing-done': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(4) > div > table > tbody > tr:nth-child(7) > td:nth-child(2)').text(),
            'final-blows': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(4) > div > table > tbody > tr:nth-child(8) > td:nth-child(2)').text(),
            'deaths': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(4) > div > table > tbody > tr:nth-child(9) > td:nth-child(2)').text(),
            'damage-done': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(4) > div > table > tbody > tr:nth-child(10) > td:nth-child(2)').text(),
            'eleminations': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(4) > div > table > tbody > tr:nth-child(11) > td:nth-child(2)').text()
          },
          deaths: {
            'deaths': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(5) > div > table > tbody > tr:nth-child(1) > td:nth-child(2)').text(),
            'environmental-deaths': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(5) > div > table > tbody > tr:nth-child(2) > td:nth-child(2)').text()
          },
          awards: {
            'cards': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(6) > div > table > tbody > tr:nth-child(1) > td:nth-child(2)').text(),
            'medals': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(6) > div > table > tbody > tr:nth-child(2) > td:nth-child(2)').text(),
            'gold': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(6) > div > table > tbody > tr:nth-child(3) > td:nth-child(2)').text(),
            'silver': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(6) > div > table > tbody > tr:nth-child(4) > td:nth-child(2)').text(),
            'bronze': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(6) > div > table > tbody > tr:nth-child(5) > td:nth-child(2)').text()
          },
          
          game: {
            'games-won': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(7) > div > table > tbody > tr:nth-child(1) > td:nth-child(2)').text(),
            'games-played': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(7) > div > table > tbody > tr:nth-child(2) > td:nth-child(2)').text(),
            'on-fire': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(7) > div > table > tbody > tr:nth-child(3) > td:nth-child(2)').text(),
            'objective-time': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(7) > div > table > tbody > tr:nth-child(4) > td:nth-child(2)').text(),
            'score': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(7) > div > table > tbody > tr:nth-child(5) > td:nth-child(2)').text(),
            'time-played': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(7) > div > table > tbody > tr:nth-child(6) > td:nth-child(2)').text()
          },
          misc: {
            'melee-final-blows-most-in-game': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(8) > div > table > tbody > tr:nth-child(1) > td:nth-child(2)').text(),
            'defensive-assists': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(8) > div > table > tbody > tr:nth-child(2) > td:nth-child(2)').text(),
            'offensive-assists': $('#quick-play > section.content-box.page-wrapper.career-stats-section > div > div.row > div.js-stats.toggle-display.is-active > div:nth-child(8) > div > table > tbody > tr:nth-child(4) > td:nth-child(2)').text()
          }
        },
        achivements: []
      };
     
      let achivements_html =  $('#achievements-section > div').find('.m-hoverable');
      achivements_html.map((e, o) => {
        response.achivements.push({
          id: $(o).data('tooltip'),
          title: $(o).find('.content').text()
        });
      });
      
      
      return res.json({success: true, data: response});
    })
    .catch(function (err) {
      return res.json({success: false, error: err});
    });
});

/* Missing right now - just dont feeled like putting this in as well right now =)*/
router.get('/details/:platform/:username', function(req, res, next) {
  let region = req.body.region;
  if (region === undefined)
    return res.json({error: "You must specify a region."});
  
  
});

module.exports = router;
