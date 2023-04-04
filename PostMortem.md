# POST MORTEM
Rasmus Johansson
04-04-2023

## Inledning
Syftet med detta arbete var att koppla samman vårt forum med login systemet vi gjort. Vi fick lära oss om databaser, hur viktigt det är att tvätta data, validation och sessioner. 

## Bakgrund
Vi började med att göra en skiss över hur systemet skulle fungera. Vilka routes som ledde vart och hur vi skulle koppla samman login systemet med forumet. 
Vi skulle även skriva en loggbok som gick över hur lektionerna gått till. Under de första lektionerna kopplade jag ihop login systemet och forumet så att man behövde vara inloggad för att posta någonting samt att man kunde registrera ett konto. Sedan började jag försöka lägga till ett sorts like-system. Det fungerade genom att varje post hade en kolumn i databasen som räknade mängden likes. Sedan för att ge användaren möjlighet att faktiskt ge en like på ett inlägg så gjorde jag en enkel route som ökar värdet med ett för varje gång den klickas på. Detta var mer av en temporär lösning då jag senare hade planerat att se till att endast folk som är inloggade kunde ge likes, samt att hemsidan inte skulle behöva ladda om för varje gång du ger en like. Sedan började vi jobba med att tvätta data och se till att den data användaren ger är korrekt. Detta gjorde vi med ett javascript tillägg och det fungerade mycket bra. Slutligen försökte jag fixa själva designen av hemsidan där min plan var att lägga till kommentarer på inlägg och ge användaren möjligheten att välja bland ett par stycken för bestämda profilbilder. 

## Positiva Erfarenheter
Det gick väldigt bra att koppla samman login systemet och forumet, det var mycket enklare än vad jag förväntade mig. 
Tvättandet och validationen av datan var även relativt smärtlöst och fungerade ganska bra.


## Negativa Erfarenheter
Jag hade problem med mitt like system då jag inte kunde få det att fungera som ett skript eftersom att det skriptet inte kan nå databasen och att ha det som en route betyder att hemsidan måste ladda om varje gång användaren ger ett inlägg en like.

## Sammanfattning
Jag tycker att detta varit ett väldigt roligt projekt där vi fått mycket frihet i vad vi får göra. Det finns en del grejer jag inte är helt klar med och skulle behöva lite mer tid för att fixa som t.ex. kommentarerna, likes, viss mobilanpassning, en bättre profil och fixa så att lösenordet inte sparas i sessions. 