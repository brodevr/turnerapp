import React from 'react';
import { MapPin, Phone, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t bg-secondary/50 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-xl mb-3 text-primary">Virginia Rojas Beauty</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Cuidado facial, diseño de cejas y realce de pestañas para resaltar tu belleza natural.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground/70">
              Contacto
            </h4>
            <div className="space-y-3">
              <a
                href="https://wa.me/5491170742867"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                +54 9 11 7074 2867
              </a>
              <a
                href="https://instagram.com/virginiarojasbeautyy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="w-4 h-4" />
                @virginiarojasbeautyy
              </a>
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground/70">
              Ubicación
            </h4>
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Belgrano, CABA<br />Buenos Aires, Argentina</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-foreground/10 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Virginia Rojas Beauty. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
