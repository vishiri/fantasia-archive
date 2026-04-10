# Journal des modifications
----------

## 2.4.11 - Version bump

### Bugfixes & Optimizations
- **Paramètres du programme** : recherche sans résultat — la carte **ErrorCard** affiche le titre **No search match** et un texte d’aide plus long en **description** (clés **vue-i18n** **en-US** et **fr**). **ErrorCard** ajoute un slot **description** optionnel entre titre et mascotte, des attributs **data-test-locator** sur titre et description, et des tests **Vitest** sur la mise en page titre + détails.
- **FantasiaMascotImage** centre l’image horizontalement lorsqu’elle est plus étroite que l’emplacement (**margin: auto** sur l’**img** interne).
- **Liens externes** : les URL **http** et **https** sont validées par analyse d’URL réelle et liste blanche de schémas avant **openExternal** côté principal ou **checkIfExternal** côté préchargement. Les boucles et cibles non routables sont bloquées (**localhost**, noms se terminant par **.localhost**, **127.0.0.0/8**, **::1**, boucle IPv4 mappée, **0.0.0.0**), **localhost** encodé en pourcentage reste reconnu, et les astuces de schéma du type **nothttps://** ne passent plus pour **https**.
- **Paramètres utilisateur** : le processus principal **Electron** valide chaque correctif enregistré avec **Zod** avant fusion dans **electron-store** (clés booléennes connues uniquement ; clés inconnues ou types incorrects rejetés). Le store Pinia **S_FaUserSettings** affiche la notification d’erreur d’enregistrement existante lorsque **setSettings** échoue (validation ou pont), au lieu d’un rejet non géré dans la console seulement.
- **Documentation contributeurs** : **README**, **AGENTS.md**, règle **electron-preload**, compétences **fantasia-electron-main** et **fantasia-electron-preload** — bac à sable du renderer, ordre d’enregistrement **IPC**, et politique **Zod** pour les charges **IPC** structurées côté principal.
- La version livrée est désormais **2.4.11** dans **À propos** et les métadonnées de paquetage.
