#!/usr/bin/env python3
"""Génère ~1000 gages génériques (ton fun/taquin, safe entre collègues).
Sortie : un gage par ligne dans gages.txt (prêt à téléverser dans l'app).
Méthode : patrons (templates) x variables -> déduplication -> 1000 lignes.
"""
import random
random.seed(42)

# --- Variables ---------------------------------------------------------------

MOTS = """banane raclette dauphin pamplemousse licorne toboggan schtroumpf
cacahuète fromage pingouin brocoli tournevis moustache chaussette parapluie
kangourou ananas gaufre tartiflette marmotte concombre flamant hippopotame
courgette biscuit nougat perroquet citrouille escargot framboise saucisson
méduse sanglier clémentine panda koala wombat ornithorynque axolotl capybara
paillette doudou nounours chamallow guimauve spatule passoire théière tabouret
pantoufle écharpe bonnet cravate bretelle chapeau casquette lampadaire
aspirateur grille-pain frigo canapé oreiller couette hamac trampoline ukulélé
triangle tambourin harmonica accordéon kazoo boomerang frisbee yoyo cerf-volant
paillasson gargouille lutin farfadet troll gnome sorcière dragon phénix kraken
yéti gremlin gobelin chimère cyclope minotaure sirène centaure mammouth dodo
diplodocus ptérodactyle vélociraptor tricératops stégosaure brontosaure ammonite
trilobite anchois sardine calamar pieuvre oursin bigorneau bulot palourde moule
huître crevette langoustine écrevisse homard hippocampe narval bélouga cachalot
otarie morse phoque loutre castor blaireau hérisson taupe belette fouine furet
lémurien ouistiti gibbon orang-outan chimpanzé gorille babouin mandrill tamarin
lamantin tatou fourmilier paresseux pangolin suricate fennec dingo coyote chacal
hyène guépard jaguar panthère lynx ocelot serval caracal puma glouton okapi tapir
gnou gazelle antilope bouquetin chamois mouflon yack bison buffle zébu dromadaire
lama alpaga vigogne guanaco macaron meringue brioche croissant chouquette éclair
flan clafoutis tiramisu cheesecake brownie cookie muffin donut bretzel popcorn
nutella speculoos chamallow barbapapa berlingot calisson dragée nougatine praline
caramel réglisse chewing-gum sucette esquimau sorbet vermicelle tapioca semoule
boulgour quinoa polenta gnocchi ravioli tortellini spaghetti macaroni coquillette
papillon farfalle penne risotto paella gaspacho houmous falafel taboulé samoussa
nem sushi maki ramen wasabi gingembre curcuma paprika cumin coriandre romarin
basilic estragon ciboulette persil aneth fenouil rutabaga panais topinambour
salsifis crosne navet betterave radis raifort câpre cornichon piment poivron""".split()

PHRASES = [
    "tu as raison", "c'est une excellente idée", "je t'adore", "tu gères",
    "carrément", "n'importe quoi", "c'est pas faux", "bien vu", "ça marche",
    "trop bien", "peut-être bien", "évidemment", "c'est noté", "avec plaisir",
    "pourquoi pas", "tu m'étonnes", "clairement", "j'avoue", "tellement",
    "c'est validé", "incroyable", "magnifique", "splendide", "fabuleux",
    "extraordinaire", "sensationnel", "complètement", "absolument", "mais oui",
    "exactement", "tout à fait", "parfaitement", "c'est ça", "voilà", "nickel",
    "impeccable", "au top", "que du bonheur", "c'est cadeau", "santé",
    "à la tienne", "bravo", "chapeau", "respect", "bien joué", "félicitations",
    "trop fort", "tu déchires", "tu assures", "la classe", "stylé", "ça envoie",
    "je valide", "tope là", "ok pour moi", "ça me va", "banco", "c'est parti",
    "on y va", "champagne", "tu es le boss", "c'est toi le patron",
    "j'ai rien dit", "comme tu veux", "c'est toi qui vois", "à vos ordres",
    "message reçu", "bien reçu", "ça roule", "tranquille", "no stress",
    "easy", "les doigts dans le nez", "fastoche", "dans la poche", "c'est plié",
    "je suis fan", "j'achète", "vendu", "marché conclu", "deal", "tchin",
]

COMPLIMENTS = [
    "ta tenue", "tes chaussures", "ta coiffure", "ton sourire", "ton énergie",
    "ton humour", "ton style", "tes lunettes", "ta montre", "ta bonne humeur",
    "ton accessoire du jour", "ta façon de parler", "ton rire", "ta présentation",
    "ton choix de boisson", "ta playlist", "ta poignée de main", "ton charisme",
]

OBTENIR = [
    "te fasse un check", "te fasse un high-five", "te fasse un pouce levé",
    "te fasse un clin d'œil", "te tape dans la main", "te serre la main",
    "te fasse un compliment", "te resserve à boire", "t'offre un café",
    "te tienne la porte", "te fasse un coucou de la main", "te fasse un cœur avec les mains",
    "te prête son stylo", "te prête son chargeur", "te montre une photo de son téléphone",
    "te raconte une anecdote", "te demande l'heure", "te demande comment tu vas",
    "te propose son aide", "te laisse passer devant", "te fasse une accolade",
    "te fasse un signe de la tête", "te dise « à plus »", "te souhaite une bonne journée",
]

OBJETS = [
    "un stylo", "un chargeur", "des écouteurs", "un mouchoir", "un chewing-gum",
    "ses lunettes", "sa bouteille d'eau", "un post-it", "un trombone", "une serviette",
    "un carnet", "un marque-page", "une gourde", "un bonbon", "un élastique",
    "une pièce de monnaie", "un briquet", "une clé", "un câble", "un stylo-feutre",
]

DO = [
    "fasse un pas de danse", "imite un animal", "chante un bout de chanson",
    "raconte une blague", "fasse un selfie avec toi", "t'imite", "parle avec un accent",
    "fasse un toast en ton honneur", "te fasse un dessin", "fasse un check secret avec toi",
    "lève les bras en l'air", "fasse semblant d'applaudir", "compte jusqu'à dix à voix haute",
    "épelle son prénom", "fasse une grimace", "siffle un air", "tape du pied en rythme",
    "fasse un câlin de groupe", "lance la ola", "fasse un pari avec toi",
    "te donne un surnom", "fasse une prédiction", "raconte son meilleur souvenir",
    "fasse un compliment à quelqu'un d'autre devant toi", "invente un mot",
    "fasse un quiz improvisé", "te montre son meilleur pas de danse",
]

REACTIONS = ["rire", "sourire", "bâiller", "applaudir", "lever les yeux au ciel", "soupirer"]

# Gages "standalone" fun/taquins (déjà rédigés)
STANDALONE = [
    "Obtenir un câlin de ta cible",
    "Faire danser ta cible (au moins trois secondes)",
    "Faire chanter ta cible",
    "Te faire prendre en photo avec ta cible (un selfie)",
    "Faire faire une grimace à ta cible",
    "Faire en sorte que ta cible te fasse un compliment sincère",
    "Faire en sorte que ta cible t'appelle par un surnom",
    "Obtenir une accolade de ta cible",
    "Faire imiter un accent à ta cible",
    "Faire raconter une blague à ta cible",
    "Faire en sorte que ta cible trinque avec toi",
    "Faire faire un toast à ta cible en ton honneur",
    "Faire en sorte que ta cible t'imite pendant cinq secondes",
    "Obtenir un high-five sauté (jump high-five) de ta cible",
    "Faire en sorte que ta cible te laisse gagner à pierre-feuille-ciseaux",
    "Faire faire la ola à ta cible",
    "Faire en sorte que ta cible te tienne la porte",
    "Faire en sorte que ta cible te resserve à boire",
    "Faire faire un check secret (handshake) à ta cible",
    "Faire en sorte que ta cible te suive sur dix mètres sans rien demander",
    "Faire en sorte que ta cible te prête quelque chose",
    "Faire en sorte que ta cible te dise « je t'adore »",
    "Faire faire un compliment à ta cible sur ta tenue",
    "Faire en sorte que ta cible te fasse un cœur avec les mains",
    "Faire faire un clin d'œil à ta cible",
    "Faire en sorte que ta cible te propose son aide spontanément",
    "Obtenir un fou rire de ta cible",
    "Faire en sorte que ta cible te dise « tu as raison » trois fois",
    "Faire faire une prédiction à ta cible te concernant",
    "Faire en sorte que ta cible te donne un conseil de vie",
    "Faire faire un compliment à ta cible devant tout le monde",
    "Faire en sorte que ta cible te fasse une bise pour dire bonjour",
    "Faire en sorte que ta cible t'offre à boire",
    "Faire en sorte que ta cible te dise un secret (anodin)",
    "Faire faire un pari à ta cible",
    "Faire en sorte que ta cible te complimente sur ton humour",
    "Faire faire un mini-discours à ta cible (deux phrases) en ton honneur",
    "Faire en sorte que ta cible te dise « tu es le/la meilleur·e »",
    "Faire en sorte que ta cible te fasse un dessin",
    "Faire en sorte que ta cible te laisse passer devant",
]

# --- Génération ---------------------------------------------------------------

gages = []

# T1 : mot à faire dire
for w in MOTS:
    gages.append(f"Faire dire le mot « {w} » à ta cible")

# T2 : faire dire un mot deux fois (sous-ensemble)
for w in MOTS[::2]:
    gages.append(f"Faire dire le mot « {w} » deux fois de suite à ta cible")

# T2b : faire épeler un mot
for w in MOTS:
    gages.append(f"Faire épeler le mot « {w} » à ta cible")

# T2c : faire écrire un mot (sous-ensemble)
for w in MOTS[1::2]:
    gages.append(f"Faire écrire le mot « {w} » à ta cible (sur un papier, un post-it ou un message)")

# T2d : faire dire un mot avec un accent (sous-ensemble, ton fun)
for w in MOTS[::3]:
    gages.append(f"Faire dire le mot « {w} » avec un accent par ta cible")

# T3 : phrase à faire dire
for p in PHRASES:
    gages.append(f"Faire dire « {p} » à ta cible")

# T4 : compliment (deux formulations)
for c in COMPLIMENTS:
    gages.append(f"Faire en sorte que ta cible te complimente sur {c}")
    gages.append(f"Faire en sorte que ta cible dise du bien de {c}")

# T5 : obtenir un geste/service
for o in OBTENIR:
    gages.append(f"Faire en sorte que ta cible {o}")

# T6 : emprunter / récupérer un objet
for obj in OBJETS:
    gages.append(f"Emprunter {obj} à ta cible")
    gages.append(f"Récupérer {obj} des mains de ta cible")

# T7 : faire faire une action
for d in DO:
    gages.append(f"Faire en sorte que ta cible {d}")

# T8 : réactions
for r in REACTIONS:
    gages.append(f"Faire {r} ta cible")

# T9 : standalone rédigés
gages.extend(STANDALONE)

# Déduplication en gardant l'ordre
seen = set()
unique = []
for g in gages:
    if g not in seen:
        seen.add(g)
        unique.append(g)

# Mélange puis on plafonne à 1000
random.shuffle(unique)
final = unique[:1000]

with open("gages.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(final) + "\n")

print(f"Candidats générés : {len(gages)} | uniques : {len(unique)} | écrits : {len(final)}")
