import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-900 text-slate-300 pt-14 pb-6 px-6">
      {/* Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">

        {/* Section 1 */}
        <div>
          <h3 className="text-xl font-semibold text-cyan-400">WordQuest</h3>
          <p className="mt-3 text-sm text-slate-400">
            Aprende jugando. Domina el vocabulario, la lectura y la escritura de forma divertida.
          </p>
        </div>

        {/* Section 2 */}
        <div>
          <h3 className="text-lg font-semibold text-cyan-400">Enlaces</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="/" className="hover:text-cyan-400 transition">Inicio</a></li>
            <li><a href="/learn" className="hover:text-cyan-400 transition">Aprender</a></li>
            <li><a href="/challenges" className="hover:text-cyan-400 transition">Retos</a></li>
            <li><a href="/about" className="hover:text-cyan-400 transition">Sobre Nosotros</a></li>
          </ul>
        </div>

        {/* Section 3 */}
        <div>
          <h3 className="text-lg font-semibold text-cyan-400">Contacto</h3>
          <p className="mt-3 text-sm">Email: soporte@wordquest.com</p>
          <p className="text-sm">Colombia</p>

          {/* Social Icons */}
          <div className="flex gap-4 mt-4 text-xl">
            <FaFacebook className="cursor-pointer hover:text-cyan-400 transition" />
            <FaInstagram className="cursor-pointer hover:text-cyan-400 transition" />
            <FaTwitter className="cursor-pointer hover:text-cyan-400 transition" />
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="text-center text-slate-500 text-sm mt-10 border-t border-slate-700 pt-4">
        © {year} WordQuest — Todos los derechos reservados.
      </div>
    </footer>
  );
}
