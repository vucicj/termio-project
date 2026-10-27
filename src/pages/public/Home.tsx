import { Link } from 'react-router-dom'
import { HeartPulse, Brain, Baby, Bone, Eye } from 'lucide-react'
import Button from '../../components/Button'
import './Home.css'

const specijalizacije = [
  { naziv: 'Kardiologija', icon: HeartPulse },
  { naziv: 'Neurologija', icon: Brain },
  { naziv: 'Pedijatrija', icon: Baby },
  { naziv: 'Ortopedija', icon: Bone },
  { naziv: 'Oftalmologija', icon: Eye },
]

function Home() {
  return (
    <div className="home">
      <section className="home-hero">
        <h1>Pronađite pravu skrb, odmah.</h1>
        <p>
          Pristupite vrhunskim zdravstvenim ustanovama i liječnicima. Filtrirajte po
          specijalizaciji i dostupnosti te jednostavno rezervirajte sljedeći pregled.
        </p>
        <div className="home-hero__actions">
          <Link to="/ustanove">
            <Button variant="primary">Pregledaj ustanove</Button>
          </Link>
          <Link to="/lijecnici">
            <Button variant="secondary">Pregledaj liječnike</Button>
          </Link>
        </div>
      </section>

      <section>
        <h2>Specijalizacije</h2>
        <div className="home-specializations">
          {specijalizacije.map(({ naziv, icon: Icon }) => (
            <span key={naziv} className="home-specializations__pill">
              <Icon size={16} aria-hidden="true" />
              {naziv}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
