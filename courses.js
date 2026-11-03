// DARSLIKLAR: yangi kurs qoʻshish uchun shu roʻyxatga obyekt qoʻshing
// Videoli dars namunasi (v: YouTube/Vimeo/mp4 havolasi):
// {t:"Dars nomi", d:"5 daqiqa", x:"Matn", v:"https://youtu.be/VIDEO_ID"}
const COURSES=[
 {id:"ai",t:"AI asoslari",cat:"ai",ic:"🤖",bg:"#2a35f0",tag:"Bepul",lessons:[
  {t:"Sunʼiy intellekt nima?",d:"5 daqiqa",x:"Sunʼiy intellekt — kompyuterlarga odamga xos fikrlash vazifalarini bajarishni oʻrgatish. Bu yerga oʻz matningizni, video havolangizni yoki PDF havolangizni qoʻying."},
  {t:"Mashinali oʻrganish",d:"8 daqiqa",x:"Mashinali oʻrganishda model maʼlumotlardan qonuniyatlarni oʻzi topadi."},
  {t:"Prompt yozish sanʼati",d:"6 daqiqa",x:"Yaxshi prompt aniq vazifa, kontekst va kutilgan natija shaklini oʻz ichiga oladi."}]},
 {id:"chat",t:"ChatGPT va Claude",cat:"ai",ic:"💬",bg:"#7a3df5",tag:"Bepul",lessons:[
  {t:"Chatbotdan toʻgʻri foydalanish",d:"6 daqiqa",x:"Savolni aniq bering, natijani tekshiring, kerak boʻlsa aniqlashtiring."},
  {t:"Oʻqish va tadqiqot uchun",d:"7 daqiqa",x:"Murakkab mavzuni oddiy tilda tushuntirishni soʻrang."}]},
 {id:"py",t:"Python",cat:"it",ic:"🐍",bg:"#0d8f6b",tag:"Bepul",lessons:[
  {t:"Oʻrnatish va birinchi dastur",d:"10 daqiqa",x:"print(\"Salom, dunyo!\") — birinchi dasturingiz."},
  {t:"Oʻzgaruvchilar",d:"8 daqiqa",x:"Oʻzgaruvchi — qiymatni saqlaydigan nom."},
  {t:"Sikllar va shartlar",d:"12 daqiqa",x:"if, for va while — dastur mantiqining asosi."}]},
 {id:"web",t:"Web dasturlash",cat:"it",ic:"🌐",bg:"#e0731f",tag:"Bepul",lessons:[
  {t:"HTML asoslari",d:"9 daqiqa",x:"HTML sahifa tuzilmasini belgilaydi."},
  {t:"CSS bilan dizayn",d:"11 daqiqa",x:"CSS rang, joylashuv va shriftni boshqaradi."}]},
 {id:"bot",t:"Telegram bot",cat:"it",ic:"✈️",bg:"#1b9be8",tag:"Bepul",lessons:[
  {t:"BotFather orqali bot yaratish",d:"7 daqiqa",x:"@BotFather ga /newbot yuboring va token oling."},
  {t:"Mini App ulash",d:"10 daqiqa",x:"Menu Button orqali sayt manzilini botga ulang."}]},
 {id:"net",t:"Tarmoq asoslari",cat:"it",ic:"📡",bg:"#c23a6a",tag:"Bepul",lessons:[
  {t:"IP va DNS",d:"8 daqiqa",x:"IP — qurilma manzili, DNS — nomni manzilga aylantiradi."}]}
];

