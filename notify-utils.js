const FCM_KEY = process.env.FCM_SERVER_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;
export async function notifyTopic(citySlug,title,body,data={}){const res=await fetch('https://fcm.googleapis.com/fcm/send',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'key='+FCM_KEY},body:JSON.stringify({to:`/topics/city_${citySlug}`,notification:{title,body},data})});return res.json();}
export async function sendEmail(to,subject,html){const res=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+RESEND_KEY},body:JSON.stringify({from:'noreply@mover.local',to,subject,html})});return res.json();}
