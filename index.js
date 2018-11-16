//#region constants
process.env.NTBA_FIX_319 = 1;
const fs = require("fs");
const torrentAppLink = "https://cdn.glitch.com/d0426cc9-a71e-4be5-93dc-4a91462ff970%2FBitTorrent.zip?1542317177251";
const apk = require('apkmirror-client');
const sortMechanismChangedMsg = 'روش مرتب سازی عوض شد.';
const wrongSortMechanism = 'اشتباهه , از منوی  زیر انتخاب کن.';
const startMsg = 'سلام ,تو این ربات هر چیزیو میتونی دانلود کنی .'+ '\n'
  +'برای دانلود به نرم افزار بیت تورنت که واسه دانلود فایلای تورنت لازمه نیاز داری. ' + 
  '\n'+'اگه این نرم افزار رو نداری اول نرم افزارو از همین ربات دانلود کن ' +
  '\n'+ 'بعد میتونی فایل های مگنت رو توی نرم افزار بیت تورنت کپی کنی تا دانلود بشن. '+
  '\n'+ 'یا میتونی از لینک مستقیم فایل تورنت رو دانلود کنی و بعد با نرم افزار دانلود رو ادامه بدی.'+
  '\n'+ 'میتونی از منوی زیر شروع کنی';
const searchLimitationMsg = 'میخوای هر بار که جستجو میکنی چند تا نتیجه ببینی؟ ' + '\n' + ''


const numberError = 'لطفا عدد وارد کن ';
const loadingMsg = 'در حال بارگذاری ';
const linkCopyMsg = 'این لینکو کپی کن تو بیت تورنت';
const torSortMsg = ' میخوای جستجو بر اساس چی مرتب بشه؟';
const torSearchMsg = 'دنبال چی میگردی؟ ';
const mainMenuMsg = 'از منوی زیر یه گزینه انتخاب کن.';

const searchLimitPanel = 'تغییر محدودیت جستجو';
const appDownload = 'دانلود نرم افزار بیت تورنت';
const searchPanel = 'پنل جستجو';
const mainMenu = 'منوی اصلی';
const torSort = 'مرتب سازی تورنت ها';
const size = 'حجم';
const uploadDate = 'زمان آپلود';
//#region bot_related
const Botgram = require('botgram');
const Telegram = require('node-telegram-bot-api');
const teleBot = new Telegram(process.env.TELEGRAM_BOT_TOKEN);
const { TELEGRAM_BOT_TOKEN } = process.env;
const bot = new Botgram(TELEGRAM_BOT_TOKEN);
//#endregion
const { search, checkIsUp, proxies } = require('piratebay-search')



//#region constant strings
const linkBroken = 'لینک خراب است';
const name = 'نام تورنت ';
const file = 'فایل مگنت ';
const seeds = ' تعداد seed ها ';
const peers = ' تعداد peer ها ';
const pageLink = ' لینک صفحه ';
const fileLink = 'لینک فایل';




//#endregion
//#endregion
//#region variables
var searchLimit = 5;

var sortMechanism = 'seeders';
var magnet2torrent = require('magnet2torrenturl');

//dictionary consisting of keys and magnets
var magnetDict =[];
var torrentCount=0;
var tempReply;
var currentState ;

//#region keyboards
var mainKeyboard = [
  [ searchPanel , appDownload],
];



var searchPanelKeyboard = [
  [ searchLimitPanel,torSort ],
    [ mainMenu], 
];

var sortPanelKeyboard = [
  [ seeds,peers],
  [ uploadDate, size],
  [ mainMenu],
];

var searchLimitaionKeyboard = [
  [ '1','2'],
  [ '5', '10'],
  [ '20','30'],
 [ mainMenu], 
];

//#endregion
//#endregion
//#region My functions

function showSearchLimitationPanel(reply)
{
    currentState = searchLimitPanel;
    reply.keyboard(searchLimitaionKeyboard,true).text(searchLimitationMsg);
}

function replyLoadMsg(reply)
{
    reply.markdown(loadingMsg);
}

function replyTorrentApp(reply)
{
   replyLoadMsg(reply);
   reply .document(torrentAppLink);
}
function changeSortMechanism(mechanism,reply) {
  if(mechanism.includes('seed')) mechanism = 'seed';
  if(mechanism.includes('peer')) mechanism = 'peer';
    switch (mechanism) {
      case 'seed':
      {
        sortMechanism = 'seeders';
        break;
      }
      case 'peer':
      {
        sortMechanism = 'leechers';
        break;
      }
      case size:
      {
        sortMechanism = 'size';
        break;
      }
      case uploadDate:
      {
        sortMechanism = 'uploaded';
        break;
      }
        
    
      default:
      {
        reply.markdown(wrongSortMechanism);
        return;
      }
    }
    reply.markdown(sortMechanismChangedMsg);
    showMainMenu('',reply);
}

function searchQuery(query,reply) {
    replyLoadMsg(reply);
  search(query, {
  
    baseURL: 'https://thehiddenbay.com', // default https://thepiratebay.org
    page: 0, // default 0
    ordering: sortMechanism // default 'seeders'. Options are 'default', 'uploaded', 'size', 'uploadedBy', 'seeders' and 'leechers'
  }).then(function reponse(res){
  replyResultBatch(res,reply);
        })
    .catch(console.error);
  
}


function showSortMenu(msg,reply) {
  currentState = torSort;
  reply.keyboard(sortPanelKeyboard, true).text(torSortMsg);
}


function showSearchPanel(msg,reply) {
  currentState = searchPanel ;
  reply.keyboard(searchPanelKeyboard, true).text(torSearchMsg);
}


function showMainMenu(msg,reply) {
  currentState = mainMenu;
  reply.keyboard(mainKeyboard, true).text(mainMenuMsg);
}

function changeSearchLimitation(newLimit,reply)
{
    if(isNaN(newLimit))
        {
            reply.markdown(numberError);
            return;
        }
    searchLimit = newLimit;
    reply.markdown('محدودیت جستجو به ' + newLimit + ' تا تغییر کرد.');
}

function convertToLink(magnet) {
return magnet2torrent(magnet)['torrentUrl'];
}

//batch is JSON
function replyResultBatch(batch,reply) {
  
  for (let index = 0; index < batch.length; index++) {
    if(index>=searchLimit)
      break;
    const element = batch[index];
    var link = convertToLink(element.file);
    let keys =[[{"text":file,"callback_data":torrentCount}],[{"text":pageLink,"url"
    :element.link},{"text":fileLink,"url":link}]];
      reply.inlineKeyboard(keys);
    reply.html(name +'<strong>'+ element.name+'</strong>' + '\n'+ seeds+
    element.seeds+'\n'+ peers + element.peers );
    let magnet = {'name':element.name,'magnet':element.file};
    magnetDict.push(magnet);
  
  torrentCount++;
    
  }
  tempReply = reply;
}


//#endregion
//#region bot callbacks

bot.command('start',function name(msg,reply,next) {
  reply.markdown(startMsg);
  showMainMenu(msg,reply);
})

bot.callback(function (query, next) {
  
  
  //if there's magnet url associated with this torrent , reply the magnet
if((magnetDict)&& (query)&&(query.data)&& (magnetDict[query.data]))
{
  let name = query.data;
  let data = magnetDict[name];
  const magnet = data.magnet;
  teleBot.sendMessage(query.from.id,magnet);
}
query.answer({'text':linkCopyMsg});
});
function onMessage(msg, reply) {
  //menu selection switch
  switch (msg.text) {
            case searchLimitPanel:
          {
              showSearchLimitationPanel(reply);
              return;
          }
    case mainMenu:
    {
      showMainMenu(msg,reply);
      return;
    }  
    case torSort:
    {
      showSortMenu(msg,reply);
      return;
    }
      
    case searchPanel:
    {
      showSearchPanel(msg,reply);
      return;
    }
    
    case appDownload:
    {
        replyTorrentApp(reply);
        return;
    }

    default:
      break;
  }
    //message handling switch
  switch (currentState) {

    case searchPanel:
    {
        searchQuery(msg.text,reply);
        break;
    }
    case torSort:
    {
        changeSortMechanism(msg.text,reply);
        break;
    }
    case searchLimitPanel:
    {
        changeSearchLimitation(msg.text,reply);
        break;
    }
    default:
      break;
  }

}
  bot.text(onMessage);
  //#endregion
