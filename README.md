# Infory Dashboard WebUI App v1.0
Infory Dashboard WebUI App v1.0 was a part of Infory Application which is a product of Infory company. For more information, please visit [http://infory.vn/](http://infory.vn/)

Infory Application
======
The aim of Infory application is to connect brands or shop owners with their customers. It includes two components which are **Infory mobile (Android & iOS) application** for users and **Infory Dashboard WebUI App** for customers (brands and shop owners). 
- On the user side, Infory mobile application is **a location-based service application** in which a user can register by a social network account (Facebook, Google++, Twitter) or a phone number. User can setup for himself a profile with personal information. After that, user can explore nearby locations in order to find best services (restaurant, shopping mall, food store, supermarket, cloth store...) based on his needs with built-in smart searching and filtering tool. Services are divided into categories for user's convenience. Infory mobile application provides interactive actions with the services (view details, like, comment, follow, post photo, share). User will gain some reward points for each intraction, and then user can redeem points for a gift, a voucher... User' interactive activity data is very helpful for later statistical analysis.
- On the customer side, Infory Dashboard WebUI App is a **Business Intelligence tool** which provide an easy and efficient way to collect user's data, to analyze the data, to create report and present actionable information to help corporate executives, business managers and other end users make more informed business decisions. From that, Infory Dashboard WebUI App helps brand/shop owners not only identify market trends and spot business problems that need to be addressed but also accelerate and improve decision making; optimize internal business processes; increase operational efficiency; drive new revenues; and gain competitive advantages over business rivals. One of the nicest functions ofInfory Dashboard WebUI App is notification center when brands/shop owners can send  messages to their subscribed users.
 

This page will focus to explain about Infory Dashboard WebUI App. It is the part that I built by myself. But for the better understanding of Infory App and of couses Infory Dashboard WebUI App, I would like to post some images from Infory mobile application v1.0.

<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1444037523/Map_update_we1eyh.png" width="20%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1444037499/Infor_epu67p.png" width="20%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1444037482/AccountSetting_irs8s4.png" width="20%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1444037481/CategoryView_iutk4q.png" width="20%"></img>

<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1444037496/Comment_mfxsea.png" width="20%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1444037479/Filter_aufqa4.png" width="20%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1444037548/UserCollection_mmcijx.png" width="20%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1444037543/ShopList_zjakcd.png" width="20%"></img>

Infory Dashboard WebUI App
======
Now, this is the time for our main actor - Infory Dashboard WebUI App. I built this Web App when I worked for Infory company since its very first time of a startup. As you know, everything in a startup must be **fast** but Infory Dashboard WebUI App is a huge WebUI app with a lot of charts, user interaction, and filters... How can I do it? I did a little research about web front-end, and I "met" and "fell in love with" AngularJS. 

Why AngularJS
======
AngularJS is a relatively new JavaScript framework by Google, designed to make your front-end development **as easy as possible**. There are plenty of frameworks and plugins available. You can use Angular to build any kind of app in a **short time**, taking advantage of features like: Two-way binding, templating, RESTful api handling, modularization, AJAX handling, dependency injection, etc.

So it will be a nice choice for WebUI App in which the actions are mostly send request, receive result from server through APIs, display them, and filters them. Two-way binding is also helpful, it makes the MVC easier (You know what I mean if you've implemented MVC model on other platforms like ASP.NET, the binding process in these platforms wasn't transparent as AngularJS.

Challenges and Experiences
======
Sound easy, huh? Yup, but everything has its darkside. 
- The **binding** process is transparent so it's cumbersome. Sometimes the binding doesn't work, and ask why!!! Most of the time, the reason is binding doesn't work for non-primitive data. For your best sake, please read [this link](https://github.com/angular/angular.js/wiki/Understanding-Scopes#ngController) 
- **Debugging** is complicated in itself, but it’s not enough, it needs to be more complicated!
- It is without a doubt the most common error that absolutely every AngularJS developer faces is **Scope inheritance**
- **Directives**: we come to the most interesting part, directives is the Holy of holies of angular. Everybody is crazy about them, people just worship them for some reason! 
- and so on.

Images from Infory Dashboard WebUI App v1.0
======
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443515206/HomePage_t1f9dw.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443515026/EventStep1_tn6f58.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443515017/EventStep2_wfzdpn.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443515040/EventStep3-News_bbb0pu.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443515026/EventStep3-Voucher_vidjvq.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443514997/CreateStep1-Email_akhc3t.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443515004/CreateStep1-inApp_tmr35z.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443515007/CreateStep1-SMS_v4h8av.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443515004/CreateStep2-Auto_qa0ooz.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443515018/CreateStep2-Onetime_glbiif.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443515008/CreateStep3-Auto_fkm4sg.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443515025/CreateStep3-Onetime_ek5hfu.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443515016/CreateFunnel_v3efuh.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443514975/Account_zglfcc.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443514975/Bill_sysfks.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443514988/Brand-Comment_io2qvt.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443514982/Brand-Gallery_csyocw.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443514984/Brand-Info-Brand_uvwubc.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443514991/Brand-Production_cnfvau.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443514992/Brand-Promotion-Manager_h8kjeu.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443514990/Brand-Properties_z4jbdl.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443514998/Brand-Segmentation_pmh2ij.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443515060/Manager_1_rwm2ms.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443515063/ResultPopup_jfnq8a.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443515039/ResultSatisfied_nnq4fi.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443515046/User-Info_fiqmu0.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443515222/Manager_l9mdyu.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443515237/ResultSatisfied_uuupks.jpg" width="97%"></img>
<img src="http://res.cloudinary.com/dppqpdago/image/upload/v1443515246/ResultPopup_hfkjjp.jpg" width="97%"></img>
