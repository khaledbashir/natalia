# Transcript of the Meeting: meeting-be50ec9d-c187-4156-b0af-97e76e88ce1c - Development of Automated Proposal System for LED Screen Projects

## Date: 1/8/2026

[00:00] So the
[00:02] The way we think about it right now is either I upload some type of Excel into the software or we find the software that connects to Salesforce and as soon as somebody creates the opportunity in Salesforce it triggers proposal. So I uh you will either have an Excel similar to uh what I sent you. Let me see if I can open that one and share the screen.
[00:33] Okay.
[00:34] So
[00:42] Okay, and here
[00:46] Let's share the screen.
[00:51] Mm.
[00:59] Uh Excel share. Can you see my Excel?
[01:05] I do, yeah.
[01:07] Okay. So either I will upload something like this to the system and when I say something like this it will have column A C and D. So usually a client think about it like this. Client comes to me and says I want to have a level even approximately three by one thousand uh square foot, but thinking it needs to be a 10 millimeter product. And I also want to see a pricing for out of town screen, Mavillian screen and level even screen. So they provide me the names of the screen and obviously I know who the client is so in this case is ABCDE. And then they don't know what product to use because they come to meet as an expert for that. They know like about what size they need but not specification. So I will put this information to the software that you will build or uh you will connect us to Salesforce that strips the disinformation from Salesforce where I typed it in. Then we have like a catalog of products. So if it's an outdoor product 10 millimeter, we won't have like a thousand, we will have like two options, this and that. And you the software will ask me a couple of questions to pick which product to use. I don't quite know what questions but we will sort that a little bit later. And then based on my answers, it will auto-populate all of this. It will tell me what product type it chose between multiple options, what millimeter each, and then it will calculate exact specification. So fee by whatever is kind of like a goal park and this exact specification for that particular product type based on the cabinet size and all of that. Then it's gonna calculate pixel count also based on the calculations that we will uh feed your software and then uh the um
[03:09] The qu qu quantity of screens is something you will also actually the quantity of screens and names of the screens is gonna be something that's like client tells me kind of like given.
[03:22] So based on the quantity of screens and the multiplications of um of um pixel counts
[03:32] Uh you arrive to your price. Uh so pricing is uh we know how much once where I post. Am I still sharing my screen? No you're not.
[03:46] Okay.
[03:48] Uh so we know how much
[03:53] We have the calculations that uh square feet by um the pricing for square feet is uh quantity of screen multiplied by this No total square foot is um square foot per screen multiplied by number of screens and then we know that the cost
[04:12] It would be
[04:14] total square feet divided by display cost.
[04:20] Okay.
[04:23] Uh is this uh the column and the names, are they are they uh always like this? The names like for example column A or B or D are are they always going to be the same or do they differ?
[04:40] Can you say it again?
[04:42] So so just I'm trying to understand. So for example you get on a on a call with a client and they explain to you what they need. Uh it i i is it you you you you you you you you you you you have this access sheet and you fill it, you you you see the the the the the the the the the the the the client needs this and that you fill this access sheet right
[05:02] So for now we'll do all this manually. So this is my template that Astimation team is using. We talked to the client, we typed in this, then we looked somewhere in our catalog, which is Excel or PDF. We typed in beat specification, we typed in this, we typed in that. We know from our data piece that for this specific screen for this specific type of display cost per square foot is a dollar, let's say. Then it's multiplications that the software that Excel is doing. It multiplies total square feet by one dollar. It provides me display cost and things like this. Um but it always gonna be in this order, this columns and things like this, yes. Okay, great, great. Now I I I I I I I I I I I I I have a better understanding. Um this is all of the different things that go into that. There's a display cost, there's shipping, then there's a total cost, which is a summary, uh not summary, is a sum of display cost and shipping, then we have some type of margin, and total price is uh um your total cost multiplied by the margin. So then all of this is kind of like calculated automatically. So
[06:25] Go ahead. Sorry. Yeah. Go ahead.
[06:29] No, it's just so this is how this Excel works. So it's a lot of manual typing and we have to look at our catalog to fill out all this information. So the hope is that if we feed in the software the catalogs and it auto-populates all of this for us, and then the catalog will have a price for square foot. Once we put price per square foot, you have a formula that you multiply price per square foot on the total square foot, you know how much is the screen, shipping is also something else, like there's a formula for shipping, and then total cost is shipping plus your cost for display, and then you apply margin on those two numbers, and this is how much we're gonna present the store cost to the client. So this is how this Excel is uh populated. Once this uh Excel is populated, there's many many other tabs. We have to calculate project management and content creation and ship uh and uh engineering and this and that for every single screen. Okay. I did not include those tabs here, but what you we we we we we we we we we we will have them. Okay, now it makes sense. Okay, I get it. Okay, right, so this is how this Excel is calculated. So it's a part one is to get generate this Excel. Then we completed this task. We use some type of formulas, we feed in some type of um what's that called? Some type of uh PDFs into the software and it spits out this Excel. And if we need to modify how this Excel looks slightly, that's fine, nobody cares. Like you can use different fonts, you can use different things, it's whatever. This is a working document. As long as the information is here and the software can generate something similar that has similar information, not looks, nobody cares. So we have this now. This sheet comes to the proposal team. Proposal team are people who make this information look pretty and ready to be sent to the client. So
[08:39] Uh
[08:43] Let me see. So this this this this is this
[08:52] And I want to share, stop sharing, and then share windows this one.
[09:00] Sure. So now that information that Excel is sends to me. Sends to me. And I'm manually typing all of this. I'm looking at the Excel and I'm typing the client's name. Sales quotation space because this is just like a name of the thing. Um Then I put the name of the client here and I Google its address.
[09:24] And it's a purchaser and I and C sports is us and our address is always the same. Now every single screen from the Excel is now on this PDF. So this is this was called on my Excel some type of level ribbon, remember? Yeah. Now it's like for this particular thing it is called it ribbon. And all those specs that you saw there 10 millimeter one screen, this is the height, this is the width, this is resolution. That information from that Excel is manually typed here, which is super annoying. For every single screen. So on that file that I send you, we had four screens. Sometimes I will have 40 screens. So I have to type information about 40 screens. So all of this is moved to this PDF in this format. Again, we can do some tweaks to this format, but I want to keep the font, the colors the same. Because this is our branding, this has been approved by our branding thing. So how this PDF looks, I'm a little bit more particular. And then for every single screen, we have a tab like this that tells how much it actually gonna cost to implement because it's a price for the screen and to ship the screen, but also you need to install put structural blah blah blah blah. All of those line items are line outline here. And this number pricing is uh the final total cost from that XL.
[11:06] Okay.
[11:08] I'm sorry, uh the pricing is what exactly again if we can repeat? Yeah. So
[11:39] So now I'm kind of hoping I'm sharing the full screen. How do I make this thing a little bit?
[11:46] Yeah, I can see I can see them.
[11:49] Okay. So do you see here it says reverse level even
[11:55] On my XL do you see that? Uh I I I don't really see like what's in there. I see the structure because the font is not very clear now.
[12:09] So this this this this this this this this this this this the name here reverse level even will repeat on my PDF as a header for specification and then as a header for the pricing and then this now reverse level even this line item
[12:27] is exactly the same as this thing.
[12:31] It's this one. Okay. And then this price, which is here, says one dollar, is a combination of
[12:40] That's a bad one for that.
[12:42] Of all the calculations we did here.
[12:46] And then we we we we we we we we we we we came to have a total price
[12:51] So this number total price is what I'm looking at and typing here as a pricing.
[12:58] And then I will have additional tabs that calculate in the same manner structural materials. And uh um
[13:08] Whatever, labor, electrical data, all of that and then at the end the number that's called total price. This is the number that goes here. And that's how we come up with the pricing for every single screen. Great. So but you don't really care yeah, uh what I'm trying to get is that you don't care about the other tabs if you had the solution that uh solves it for you. So if the software that we're building is you basically feed it the let's say you know, just for the sake of uh uh uh uh uh uh uh uh uh uh uh wording here, we give it the catalogue, the product, and we give it uh a really good system prompt and so on. And then what you do basically is with how how how how how how how how how how how how how how how how how how how how how you imagine it would happen, you give it let's say the meeting notes or the client brief. It will then automatically think, generate, do the math for everything.
[14:06] And basically gives you let's not not let's not talk PDF, let's just talk text.
[14:12] It just gives you the text that is the table uh with with with with with with with with with with with the subtotal the pricing and everything. You wouldn't need the other tabs, correct? Am I following?
[14:25] I would need other so this tab helps you calculate cost for for the screen. How would you know how to calculate cost for structural materials? So imagine that um Well structural materials is uh is is new for every screen because it depends on the on the size of the screen on all different things, if it's an outdoor or indoor. So every single time we gonna have a screen we will have to have some type of prompts that ask you is it an indoor or an outdoor screen? Is it front um service or back service? Is this this this this this this this this this this this or that and that way it's gonna be indoor or outdoor do we have a specific pricing for example for the indoor uh or does that change?
[15:18] Yeah, change every time. There's like maybe twenty different options. There can be different millimeter speech, they can be outdoor indoor. It can be um like um like a wavy screen or it can be a straight screen, it can be different different things. So you will have to have many prompts that ask us questions like is it an outdoor screen or indoor? Is it gonna be curvy or is it gonna be straight? Is it gonna be mounted like this or mounted like that? Is it gonna have uh do you need a ladder or you need uh blah blah blah? And that's how you're gonna arrive to structural material of cost. And then depending on all those questions, you will have a list of questions to answer. And you will come up with a structural labor and installation cost. And then you will say is there an outlets there, is there electrical, or we need to pull cables, and that's how you're gonna calculate electrical data. And then you will ask us questions about how many people need to be on site, how long is gonna be installation, and you will calculate project management. And then you will ask questions about um
[16:29] Do we have drawings so we provide drawings? Do we pay for permit or client pays for permit? And that's how you're gonna calculate this line item. And then you will ask us questions about control system and that's how you're gonna calculate this. So LED display is one piece of a puzzle, but every single line item here has the same tab like this one and even more complicated to calculate all of these guys.
[16:58] Okay. Uh Natalia just to understand like uh well like what if or maybe I'm just like I'm just trying to to to to to to to to to to to to get uh the the full picture so what wouldn't you would wouldn't it be easier if you for example had the phone call recorded or basically everything that the client needed is is is is is is is is is is is is set in one file in in a text and then you give it to the AI then the AI spits out the whole thing like why wh wh wh wh wh wh wh wh wh why uh I I I'm just trying to get like the question part like wouldn't it be easier if it was pre-answered already
[17:38] Well it's not clients job to know how to install LED. Client doesn't come to us saying I want it to be friend service. Client come to us saying I have a million dollar I want a cool screen. And then it's our job to say, okay, we think for this piece, this is gonna be the screen we're gonna provide. And this is how much it's gonna cost to install it. We have a calculations in Excel that show that. And then we will say okay, this is gonna be how much this and that is gonna cost. So uh
[18:21] Uh so we uh yeah I I don't know like there's no way to to have that type of calculation done in a text format. Like you need to apply some formulas to structural materials, you need to have like uh we have some type of formulas that we use. We say that if this is that structural material will be twenty percent of LED cost and then labor will be fifteen percent of this and that. So we have like formulas that we use to ballpark how much things are gonna cost. And we will provide you with all of that data of course. So you will you will have the formula, but you will need to set up the software in a way that it prompts us with those questions and then puts them somewhere on the separate tab every time. Okay, uh to be honest with you, I in order for me to like get everything and so on, I definitely need the data, all of it, uh everything you can give me. So I can sit with myself and just really like study and and you know kind of like try to you know tailor or customize the best approach or the best solution because this is a little you know uh it it it's not um you know it's not like uh one plus one equals two kind of thing, you know what I mean? So uh we need to we need to really it is not and I'm not expecting this project to be done in like 15 hours. This is not that type of project. It's gonna take you a couple of weeks to build. So my uh the the purpose of this call is to get like a ballpark, what do you think how much you charge per hour and how long do you think it's gonna take you from understanding all the uh you need to understand all of things we need to do. You need to meet with different people, estimators will explain you how they calculate structural materials. I will explain you what I'm looking for the PDF to look like. Then you will build some type of prompts for us. We will try it out, we will say what's not working, you will come back and revisit that. Then we will play with this some more. We will come back to you, you will revise this, all of this, like if you give me like a ballpark of like it's gonna be a month of work, it's gonna be like three weeks of work, two weeks, one week, six months, I don't know. Just this is what I'm looking for to get from this ball. Sure. Uh okay, let me be honest with you. Again, I can I can give you an estimate like right now from my little understanding, but this is uh not yet. Okay, let me just talk to you here. Basically what I'm going to give you is a platform. It's called a uh uh uh uh uh uh uh uh uh uh a rag. It's uh going to pull data and uh do the math and eventually eventually you get uh uh a PDF based on your branding. Um the the trick here is the data and the calculation. I first need to make sure that I'm going to be able to get a valid uh victory as they say. So um in order to do if you need a number like I can give you just quickly I'm expecting anything from like two thousand to four thousand dollars that will take between two to three weeks. But this is just me talking like you know uh ballpark. I would really need to to get the data all of it. I can study it today. I can uh then I can send you a uh uh uh uh uh uh uh uh uh uh proposal with everything that will be done exactly and how we will do it. And the way I see it is that we do it on uh in in in in in in in in in in in in in in in in in in in in in in two parts. The first part is where you do this manually. When I say manually, I I mean uh not automated in terms of salesforce, like salesforce will be the second step.
[22:20] Uh because we first need to make sure
[22:23] the you know the logic is is is is is is is is is is is is is okay. Once once that is set and it's stable then if you want you can we can you know talk about connecting it to Salesforce.
[22:37] But what I mean right now is I I'm thinking you speak to a uh
[22:45] questions you answer those questions eventually it gives you a um you know the text for the video you click a button that button
[22:54] uh g g g g g g g g g gives you the PDF that you need. Uh are we okay so far?
[23:01] Uh uh will it give me an Excel with uh all of these calculations or no? I I can give you an Excel yeah. We can do two parts. We can do
[23:10] C S V and uh PDF.
[23:13] Yeah, we we kind of like um give me a second I'm I'll try to see if I can open some UPDF and then uh for me to send it to you I will need you to sign like an NDA but I will let me see if I can show you like uh an example of uh proposal that has um different tasks. Yeah please
[23:39] And then we w w won't be able to I won't be able to send it to you un un un un un un un un un un unless we this is a bad example. Yeah, I'm I I'm ready if you want me to sign any kind of uh anyway.
[24:19] Alright, so let's see.
[24:25] Do you see my XL?
[24:30] I no no no no no no no no no no no I do yet.
[24:34] Okay, so so these are the the the the the the the the the the the screens that we're pricing
[24:39] And then this is our vendor, this is our product, this is our millimeter feach and sizes and so on. This is how many things, and this is how much square foot cost, and this is the display cost. So you kind of saw all of this already on a previous step, on a previous example, right?
[24:58] You only send me one tab one extra that has one tab, you know, just as an example. So so so so so so so so so so so this tab is this this tab is what you saw before correct?
[25:08] And like I said, uh it's not very clear for me here what I'm seeing. I see the structure but not the exact thing.
[25:16] Yeah, well I I'm not sure how to fix that because it's already pretty big.
[25:23] Uh so this is this is the same thing that I send you in my example the same tab that talks about LED screens and then um
[25:34] the uh all the different details that's pixel pitch uh pixel count square foot number of screens all of that you saw this in a in example that I shared that was the redo file now on top of all of this how do I look this way there is a tab that's called installation and this is the tab that talks about every single screen which is right here
[26:00] uh so this name digital dios or dios whatever it pulls the name from another tab and then these are height and width and these are different formulas that calculate the structural section
[26:20] Structural labor section is calculated here.
[26:24] So this tab had been scene talks about how we calculate for every single screen the labor and uh um
[26:37] Label things like this.
[26:42] And this this here is calculated install. And then there's a tab install h57.
[26:50] Five seven
[26:56] So this is the number. So there's in this particular uh I guess there's no s no I kind of like
[27:05] I didn't I wasn't completely correct. There's no uh tab that is uh calculating every there's no tab for every single line item all of these three line items structural labor and installation are living in one tab that's called install
[27:24] Um so
[27:27] There's some type of formulas that estimators came up with that help them calculate how much all of this is gonna cost. So
[27:36] The prompt that you're gonna be building will be asking those questions and then filling out this sheet for every single screen.
[27:46] Every single screen. This exact sheet you mean? You want this uh template exactly?
[27:56] W when you say that what do you mean?
[28:00] Um okay so so so basically the the the system will generate the the the proposal
[28:07] Or and it will do the calculation. Let's say first step is tech. Then let's say you click a button or uh something and then it becomes uh a PDF. And then it becomes a C S V. Do you want it to go ahead and copy this exact template and then replace whatever is in there with the new content. No Excel and PDF won't be Excel and PDF won't be the same exact documents. Excel has all the backup calculations and PDF only has a client facing information. So I will need to have an Excel that I can open to see what software did to arrive to a structural material number. I will need an Excel that shows me uh the margin that I used. So Excel will be pretty much an answer to every single question and all the calculations that like software ask me a a a lot of questions, I answer them, and then it speeds out an Excel. And then uh
[29:12] Uh
[29:15] There's another kind of like step where you deduct that information. You take out the margin, you don't show all the calculation for structural material. You just provide one number to the client saying structural material will be a million dollars, but somewhere there is a backup Excel that shows how you arrive to a million dollars because it's a um you're adding the number that you paying people, you're adding number that you buy the steel for this and that. So those are two different kinds of things. Client only sees what I want the client to know, and then there's a backup Excel that's um is generated based on the text from the software.
[29:56] Does it make sense? I it does absolutely. I actually uh if if if if if if if if if if if you have a minute, like if you just give me a minute, I can open something for you and just to make sure we are on the same page with that be alright, but I need like an Yeah, I'm a little bit I have like um I need to jump on the next roll, but uh if you can provide me some type of summary of like how you you want to do that and some type of uh uh uh pricing what it's gonna cost. And uh I'd rather you be uh uh generous with your hours because if you say you're gonna build it in two weeks and I put it for two weeks and you cannot complete it in two weeks, we're both gonna be in trouble. Like I would rather you put some cushion there. Um rather you finish a little bit earlier and then just put a fixed price for whatever it's gonna cost. And then oh I'm I'm 100% sure there will be changes. First of all, we will want to have some type of integration with Salesforce, and then we will think about something else. We'll wanna out-timate this, we'll w w wanna like once you start getting into this piece, you always want to improve something. So put some type of number for like a monthly maintenance. If we hire you like an hourly rate will be this much to kind of like reach out to you and to to do different updates, different like whatever. Um I'm saying that because we we we we we we we we we we we went through the uh we used to have proposals just like a PDF files, but then we decided to invest into a digital uh uh uh uh uh uh uh uh uh uh software that does our proposals. And once we start doing that, we'll be like, okay, this is great, but then a month later we're like okay, let's come up with something else. Okay, let's add this, let's add that. Great. So it's always gonna be like whatever update. So I would like to see like approximate estimate of how many weeks is gonna take you and put some pushing there because I don't want it to be like oh he said two weeks, it's you know it's already going on the third week, what's going on, things like this. And then uh pricing, how much it's gonna cost, and then um I want you to like have in mind that you will need to spend a couple hours with estimators to like understand how they build all of this. So in your proposal um account for at least like two three hours with estimators going through the process, going through what needs to be there, uh like math calculations, things like this, and then put at least an hour with proposal team to talk about granting where the logo goes, what kind of fonts we wanna see, all of the details that goes into a client facing proposal. So at least like four hours to just purely get to know like the team to understand formulas and the rest for how many time you need to to actually build it. Okay, and that's I I I I I I I I I I I have uh uh uh uh uh uh uh uh uh uh uh a a proposal for you right now, no strings attached whatsoever. I will what I would like to do actually is to get everything you can give me, whatever is in is in your hands or you can give me I would love to have it. I would love to spend some time on my expense, no worries. Uh and then I what I would like to do is I would like to show you uh uh a demo, let's say an approximate demo. Just because I don't want to you know like I want to show it because the engine is there. I told you I'm I I I I I I I I I I I already built it, but uh then this whole setup that that needs to be uh done. So if you can give you a few. Okay, let me work today on uh on getting this approved. I need to get some blessings to send you this. I will send you NDE. I will send you the file that I can show you and then um uh let me know like if we we we we we we we we we we we can when you you you you you you you you you you you will have a demo to to talk about it, okay? Absolutely, absolutely. Very nice. Thank you so much for your time. Let me jump to the next call, but I I I I I I I I I I I will send you things as soon as I can. Bye. Bye bye.

Natalia Kovaleva, ANC Sports Enterprises,LLC
Automate Proposal Response Process Development
Wednesday, Jan 07
Ahmad Basheer
7:58 PM
Hi there,



I read your post regarding the high volume of LED display requests you are managing. It sounds like you are looking to build a robust CPQ (Configure, Price, Quote) engine rather than just a simple chatbot.



The challenge here isn't just generating text; it's reliably merging strict pricing logic (which must be mathematically perfect) with persuasive, AI-generated content into a polished, branded document. I specialize in architecting these exact types of automation pipelines where internal data needs to be transformed into client-facing assets instantly.



Before proposing a specific technical roadmap, I have three quick questions to ensure I scope this correctly:



Data Access: Is your "internal database" currently accessible via an API or SQL connection, or will the automation need to parse raw exports (CSV/Excel)?



The Output: When you mention "branded budget proposals," are these complex PDF layouts with images and tables, or standard document templates?



The Logic: Is the pricing calculation strictly formula-based (e.g., sq ft * pixel pitch + labor), or does it require human "approval" steps before the final document is generated?



I am available to discuss your workflow and how we can reduce the manual friction in your response process.



Best regards,

View details
NK
Natalia Kovaleva
7:58 PM
Ahmad, really like your CL and questions. Whats the best way to clarify, chat here or short call?

Ahmad Basheer
8:16 PM
Hi Natalia,



A short call is definitely the best move to finalize this.



To ensure I don't waste your time on the call with basic discovery questions, I’d love to review your current workflow beforehand. If you are comfortable sharing any of the following now, it would allow me to come to the meeting with a technical roadmap already sketched out:



The Trigger: A screenshot or paste of 2-3 typical request emails you receive.



The Logic: Your current pricing sheet or Excel formula (anonymized is fine).



The Goal: One example of a finished 'perfect' PDF proposal you want to replicate.



Note: If any of this is sensitive or you prefer to walk through it live, just let me know—no pressure at all. Even just knowing which of these exist helps me prepare!



Let me know what you think, and we can lock in a time

NK
Natalia Kovaleva
9:38 PM
Hi Ahmad,

A trigger would/can be a different thing, like me manually addind dsiplays, Salesforce entry (if possible to integrate), excel, pdf with names, client bid from ect.

excel an PDf i am more comfortable sharing via call so we dont need to go througt NDA

Ahmad Basheer
10:57 PM
Hi Natalia,



I didn't want to just reply with text, so I recorded a quick video to show you the logic in action.



To be transparent: I have been building a proprietary "Proposal Engine" designed to automate complex quotes for high-volume integrators. When I reviewed your requirements, I realized my engine is already 90% of what you need—it just required your specific fuel.



I couldn't sleep, so I loaded ANC’s deep-technical specs (the LG GPPA062 outdoor units, the LiveSync operating system, and the specific UEFA safety certifications) into the system to test the architecture.



Watch the demo here (2 min): https://www.loom.com/share/bdceb8bc8e604af799807e63a93d034a



Want to drive it yourself? I created a private sandbox environment for you. You can log in and try asking it for different venue setups (e.g., "I need a scoreboard for a college stadium" vs "I need a ribbon board for an arena").



Link: https://basheer-everythingllm.x0uyzh.easypanel.host/login?nt=1



Username: Natalia



Password: 11223344



Important Note: The PDF export currently uses my raw "Developer Template." It is ugly, and the columns might need renaming. Ignore the design. The focus right now is that the math, the product selection logic, and the ROI stats are happening automatically.



If this logic works for you, we can move forward to "skin" the PDF with ANC’s official branding and finalize the layout.



Let me know what you think.



Best, Ahmad


Thursday, Jan 08
NK
Natalia Kovaleva
12:17 AM
That’s so cool! Would love to show you my specific template and specs / pricing line items I use to get a quote. What’s your availability for tomorrow?

To get your quote that is. I’m presenting to my boss on Monday so Friday will work as well for a short 15 min call

Ahmad Basheer
12:28 AM
Hi Natalia,



Yes, I would love to talk tomorrow. I am flexible, so please choose whatever time works best for you and send the invite.



To be honest, I wasn't sure if you changed your mind about sharing the files or if you meant you wanted to show them to me during the call.



If you are comfortable sending the template and pricing specs now, I definitely prefer that. It would let me load your data and connect the logic tonight. That way, instead of just talking about it, I can make sure everything works perfectly so you have a live, working demo to show your manager on Monday.



I am happy to sign an NDA immediately if that makes you feel more comfortable sharing the files.



Let me know what you prefer!



Best, Ahmad

NK
Natalia Kovaleva
3:26 PM
Sorry i just saw this.

2 files 
ANC_ABCDE LOI_12.12.2025 (2).pdf
280 kB
ABCDE - SPECS NK 12.12.xlsx
4 MB
here are 2 files i can share - one is how we have specs, second is final product. while it is a good example, i reducted a lot of info so maybe easier to talk it through on the call.

Also, i did not bother with math to work, meaning excel cost does not match PDF cost, and of course they will on the actual proposal. I also did not include tabs that explain Structural Materials, Structural Labor and LED Installation, Electrical and Data - Materials and Subcontracting, Project Management, General Conditions, Travel & Expenses, Submittals, Engineering, and Permits, Content Management System Equipment, Installation, and Commissioning

actual exel cost sheet has tab for each

i can do 11-12 EST, 1:3-2:30 est

NK
Natalia Kovaleva
5:18 PM
my 11:30-12 is booked, i now have 11-11:30 and 2:2:30

let me know asap

Ahmad Basheer
5:26 PM
11:30 is great Natalia just quick question is this how you imagine you would it use it as in is this the kind of the client brief/ prompt and is this the kind of output https://www.loom.com/share/022f01da429247f680f7dc2dca04e522


NK
Natalia Kovaleva
5:30 PM
i am not sure what i was looking at. I imagine opening some type of software and adding a prompt/software receives notification from Salesforse. 2. i add all the questions i am prompted to/software extracts from excel/salesforce. 3. software matches answers to the correct product in the excel catalog. 4 software applies margin i asked for. 5. software calculates sipping, project management etc etc . 5. software generates pDF

i do not have 11:30 its booked now. Please send invite to 11 am est or 1:30 est

Ahmad Basheer
5:39 PM
ANC Sports Enterprises,LLC
Thursday, January 8 · 6:00 – 6:30pm
Time zone: Africa/Cairo
Google Meet joining info
Video call link: https://meet.google.com/nbg-vevn-ovk

NK
Natalia Kovaleva
5:40 PM
thanks. chat soon

Ahmad Basheer
7:13 PM
Hi Natalia,



Thank you again for the call today – walking through your current workflow and constraints was incredibly valuable. It is clear now that we are not just building a document generator, but a full Estimator Logic Engine that needs to handle complex variables (Structural, Labor, PM, etc.) and produce dual outputs (client-facing PDF + internal audit Excel).
​



To give you a realistic timeline and an accurate fixed‑price proposal, I’ll need to go through the “source material” so I can map out the logic in detail and mirror the math your Estimators already trust.
​



Please send the following when you’re able:
​



The NDA: So we can share unredacted files freely.



The “Master” Excel: Specifically the tabs you mentioned (like the Install tab) that contain the formulas for Structural, Labor, PM, and related cost calculations, so I can see exactly how the math works and replicate it.



The “Internal” output example: An example of the “ugly Excel” backup file your Estimators use to audit the numbers, so the internal view matches how they currently review and validate a quote.



Brand assets for the PDF skin:



High‑res ANC logo (PNG or SVG).



Brand color codes (Hex or RGB values for the ANC blue).



Font details: Either the .ttf / .otf files if you use a non‑standard font, or the font names if they are standard system or Adobe/Google fonts.



Anything else you think I should review (for example, a representative “full” cost sheet with all tabs, or notes your Estimators use when validating complex projects) would also be very helpful to make sure the engine reflects how your team really works.
​



Once I receive these, I will map out the architecture for the Estimator Logic Engine and then send over the formal proposal with the timeline we discussed on the call.
​



Best regards,
Ahmad

NK
Natalia Kovaleva
8:33 PM
Hello Ahmad, unfortunately i did not get a permitting to share our installation logic sheets so please provide a proposal without

assume that those will be a series of question that have formula ttached to each possibility to calculate

Skip to content
Upwork home

Find work


Deliver work


Manage finances

Messages
Search

Search category:
Jobs



Account Settings
You have already submitted a proposal for yourself. However, you can submit additional proposals for other agency freelancers by switching to your agency account.
View Proposal
Automate Proposal Response Process Development
Posted 2 weeks ago
Worldwide

Specialized profiles can help you better highlight your expertise when submitting proposals to jobs like these. Create a specialized profile.

Summary
ANC receives a high volume of fast turnaround LED display requests that require quick pricing, specifications, and branded budget proposals.

We are seeking an experienced prompt developer to automate our proposal response process. The ideal candidate will have a solid understanding of automation tools and programming languages to streamline our workflow. 

Your role will involve creating scripts or applications that can take information from our internal database, calculate pricing and generate responses to proposals, improving our efficiency. If you have a passion for automation and a knack for problem-solving, we'd love to hear from you!

Hours to be determined
Hourly
1 to 3 months
Duration
Intermediate
I am looking for a mix of experience and value
Project Type:Ongoing project
You will be asked to answer the following questions when submitting a proposal:

Describe your recent experience with similar projects
Skills and Expertise
Mandatory skills
Python
Business Process Management
Business Process Automation
Automation
Process Engineering
Preferred qualifications
English level:
Conversational
Activity on this job
Proposals:
15 to 20
Last viewed by client:
yesterday
Interviewing:
4
Invites sent:
6
Unanswered invites:
3
Upgrade your membership to see the bid range
Required Connects to submit a proposal: 13
Available Connects: 11
About the client
Payment method verified
Phone number verified
United States
3:23 PM
1 job posted
0% hire rate, 1 open job
Manufacturing & Construction
Mid-sized company (10-99 people)
Member since Dec 26, 2025
Job link
https://www.upwork.com/jobs/~022004558121014557586
Copy link
Footer navigation
About Us
Feedback
Trust, Safety & Security
Help & Support
Upwork Foundation
Terms of Service
Privacy Policy
CA Notice at Collection
Your Privacy Choices
Accessibility
Desktop App
Cookie Policy
Enterprise Solutions
Release notes
Follow Us
Visit Upwork on Facebook
Read Upwork company news on LinkedIn
Follow @Upwork on Twitter
Watch Upwork videos on YouTube
Follow Upwork on Instagram
Mobile app
Download Upwork app from iTunes
Download Upwork app from Google Play
© 2015 - 2026 Upwork® Global LLC