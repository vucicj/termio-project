# Termio

Termio je web-aplikacija za online naručivanje pacijenata na preglede kod liječnika. Studentski projekt treće godine preddiplomskog studija informatike ("Razvoj online sustava za podršku pružanju medicinskih usluga").

Aplikacija ima tri korisničke uloge:

- **Pacijent** — pregledava zdravstvene ustanove i liječnike, rezervira termine, upravlja vlastitim rezervacijama
- **Liječnik** — pregledava vlastiti raspored i rezervacije, potvrđuje ili otkazuje rezervacije pacijenata
- **Administrator ustanove** — upravlja liječnicima i terminima svoje ustanove, pregledava rezervacije

## Korištene tehnologije

- **React 19** + **TypeScript** — korisničko sučelje
- **Vite** — razvojni server i izgradnja aplikacije
- **React Router** — navigacija između stranica
- **Lucide React** — ikone
- **Supabase** — baza podataka (PostgreSQL), autentifikacija (Supabase Auth) i automatski generiran REST API (PostgREST)
- Obični CSS (CSS varijable za dizajn-sustav), bez dodatnih UI biblioteka


## Instalacija i pokretanje

```bash
npm install
npm run dev
```
