# Dokumentácia projektu Trip Finder App

## Edge case: Čas v minulosti pri vyhľadávaní spojenia

**Problém:**
Ak používateľ zvolí čas odchodu, ktorý je v minulosti (napr. medzi načítaním stránky a odoslaním formulára sa čas posunie), backend vráti prázdny výsledok alebo error, lebo spojenie v minulosti neexistuje.

**Riešenie:**
Pri submitovaní formulára na klientovi kontrolujeme, či je zvolený čas v minulosti. Ak áno, automaticky posunieme čas na najbližšiu možnú minútu (aktuálny čas +1 minúta) a až potom odošleme request. Týmto predídeme frustrácii používateľa a zbytočným requestom na backend.

**Implementácia:**

- Porovnáme zvolený dátum+čas s aktuálnym časom.
- Ak je v minulosti, nastavíme čas na aktuálny čas +1 minúta.
- Do requestu posielame už upravený čas.

Tento edge case je dôležité riešiť pre robustnosť a UX aplikácie.
