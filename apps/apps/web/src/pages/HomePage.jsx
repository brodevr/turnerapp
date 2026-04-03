import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import {
  Star,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Heart,
  Sparkle,
  Gift,
  MapPin,
  Phone,
  Clock,
  Instagram,
  Mail,
  ChevronDown,
} from 'lucide-react';
import { useClientAuth } from '@/contexts/ClientAuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/lib/apiClient';

const FALLBACK_IMAGE = '/images/facial-treatment.png';

const BUSINESS = {
  name: 'Virginia Rojas Beauty',
  address: 'Av. Juramento 1957, Belgrano, CABA',
  neighborhood: 'Belgrano, Ciudad Autónoma de Buenos Aires',
  phone: '+54 9 11 7074-2867',
  phoneHref: 'tel:+5491170742867',
  whatsapp: 'https://wa.me/5491170742867',
  email: 'contacto@virginiarojasbeauty.com.ar',
  instagram: 'https://www.instagram.com/virginiarojasbeautyy',
  mapsUrl: 'https://maps.google.com/?q=Av+Juramento+1957+Belgrano+Buenos+Aires',
};

const testimonials = [
  {
    name: 'Desirée Jalif',
    rating: 5,
    text: 'Virginia es una profesional espectacular!! Me realizó el mejor lifting de pestañas que me hicieron, súper natural. También me perfilé las cejas y me encantó!! Probé su limpieza facial y fue un antes y después en mi piel. Salí con la piel fresca y súper glow 😍 Recomiendo muchísimo sus servicios!!',
    service: 'Lifting · Cejas · Limpieza Facial',
  },
  {
    name: 'Valentina Larreu',
    rating: 5,
    text: 'Vir es super amorosa y profesional 🩷 me dejó mis pestañas y cejas hermosas ✨',
    service: 'Lifting · Cejas',
  },
  {
    name: 'Andrea Veliz',
    rating: 5,
    text: 'Me encantó la limpieza facial, lifting e hydralips! muy completo todo, súper encantadora Vir ❤️❤️❤️',
    service: 'Limpieza Facial · Lifting · Hydralips',
  },
];

const faqs = [
  {
    q: '¿Dónde está ubicado el salón?',
    a: `Estamos en ${BUSINESS.address}. A pocas cuadras del subte D (estación Juramento).`,
  },
  {
    q: '¿Cómo puedo reservar un turno?',
    a: 'Podés reservar directamente desde nuestra web en cualquier momento, o escribirnos por WhatsApp.',
  },
  {
    q: '¿Cuáles son los horarios de atención?',
    a: 'Atendemos de lunes a sábado de 9:00 a 17:00 hs.',
  },
  {
    q: '¿Qué servicios ofrecen?',
    a: 'Nos especializamos en limpieza facial profunda, lifting de pestañas, laminado y perfilado de cejas, y tratamientos complementarios de belleza.',
  },
  {
    q: '¿Se requiere seña para reservar el turno?',
    a: 'Para algunos servicios solicitamos una seña al momento de la reserva. El monto se indica antes de confirmar.',
  },
];

const FALLBACK_PROMO_IMAGE = '/images/promo-first-visit.png';

/* ── FAQ Accordion item ─────────────────────────────────────── */
const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-primary/10 last:border-0">
      <button
        className="w-full flex justify-between items-center py-5 text-left gap-4 hover:text-primary transition-colors"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="font-semibold text-base">{q}</span>
        <ChevronDown className={`w-5 h-5 shrink-0 text-primary transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-muted-foreground leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── FAQ JSON-LD Schema ─────────────────────────────────────── */
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

/* ══════════════════════════════════════════════════════════════ */

const HomePage = () => {
  const { clientUser } = useClientAuth();
  const [services, setServices] = useState([]);
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    apiClient.services.getAll().then(all => {
      setServices(all);
      setPromos(all.filter(s => s.is_promo));
    }).catch(() => { });
  }, []);

  const bookingHref = clientUser ? '/professionals' : '/identity';

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">

      {/* ── SEO Head ──────────────────────────────────────────── */}
      <Helmet>
        <title>Virginia Rojas Beauty | Salón de Belleza en Belgrano, CABA</title>
        <meta name="description" content="Salón de belleza en Belgrano, CABA. Especialistas en limpieza facial profunda, lifting de pestañas y laminado de cejas. ⭐ 4.9 en Google. Reservá tu turno online." />
        <meta property="og:title" content="Virginia Rojas Beauty | Salón de Belleza en Belgrano, CABA" />
        <meta property="og:description" content="Lifting de pestañas, limpieza facial y laminado de cejas en Belgrano, CABA. ⭐ 4.9 en Google." />
        <meta property="og:url" content="https://virginiarojasbeauty.com.ar/" />
        <link rel="canonical" href="https://virginiarojasbeauty.com.ar/" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <main className="flex-1 overflow-x-hidden">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section
          aria-label="Salón de belleza en Belgrano"
          className="relative min-h-[90vh] flex items-center pt-16 bg-gradient-to-br from-secondary via-background to-accent/30"
        >
          <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
            <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="max-w-2xl"
            >
              {/* Rating pill — keyword + social proof */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                  <Sparkle className="w-4 h-4" aria-hidden="true" />
                  Belgrano · CABA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-700 text-sm font-semibold border border-yellow-200">
                  <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  4.9 en Google
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 leading-[1.1] text-foreground">
                Lifting de Pestañas{' '}
                <span className="text-primary">y Limpieza Facial</span>{' '}
                en Belgrano
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
                En <strong>Virginia Rojas Beauty</strong>, en <strong>Av. Juramento 1957, Belgrano</strong>, nos especializamos en tratamientos faciales, laminado y perfilado de cejas, y realce de pestañas para resaltar tu belleza de forma natural.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  asChild
                  className="h-14 px-10 text-lg rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                >
                  <Link to={bookingHref}>
                    Reservá tu turno
                    <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-14 px-10 text-lg rounded-full border-foreground/20 hover:bg-foreground/5"
                >
                  <a href="#servicios">Ver Servicios</a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Brand Promise ────────────────────────────────────── */}
        <section aria-label="Por qué elegirnos" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Profesional certificada',
                  text: 'Formación en Venezuela y Argentina con más de 5 años de experiencia en tratamientos faciales y estéticos.',
                },
                {
                  icon: Heart,
                  title: 'Productos profesionales',
                  text: 'Materiales de calidad profesional, seguros para el cuidado de tu piel y resultados duraderos.',
                },
                {
                  icon: Sparkles,
                  title: 'Atención personalizada',
                  text: 'Cada rostro es único. Analizamos tu piel y tus cejas para lograr resultados naturales y armoniosos.',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="space-y-4"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl shadow-sm border border-primary/10 flex items-center justify-center mx-auto mb-6 text-primary">
                    <item.icon className="w-8 h-8" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services ─────────────────────────────────────────── */}
        <section id="servicios" aria-label="Servicios de belleza en Belgrano" className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Nuestros Servicios en Belgrano</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Tratamientos de belleza especializados para resaltar tu mirada y cuidar tu piel, en el corazón de Belgrano, CABA.
              </p>
            </div>

            {services.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6" aria-busy="true" aria-label="Cargando servicios">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-64 rounded-2xl bg-primary/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {services.map((service, i) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Card className="group overflow-hidden border border-primary/5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 rounded-2xl bg-white h-full flex flex-col">
                      <div className="relative h-32 md:h-40 overflow-hidden">
                        <img
                          src={service.image_url || FALLBACK_IMAGE}
                          alt={`${service.name} en Belgrano, CABA`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" aria-hidden="true" />
                        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg">
                          <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />
                        </div>
                      </div>
                      <CardContent className="p-4 md:p-5 flex flex-col flex-1 text-center">
                        <h3 className="text-sm md:text-base font-bold mb-2 leading-tight">{service.name}</h3>
                        {service.description && (
                          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-3 flex-1">
                            {service.description}
                          </p>
                        )}
                        <Button asChild variant="ghost" size="sm" className="w-full text-primary hover:bg-primary/5 text-xs mt-auto">
                          <Link to={bookingHref}>
                            Reservar Turno
                            <ArrowRight className="ml-1 w-3 h-3" aria-hidden="true" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Promos ───────────────────────────────────────────── */}
        {promos.length > 0 && (
          <section aria-label="Promociones" className="py-24 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 border border-primary/20">
                  <Gift className="w-4 h-4" aria-hidden="true" />
                  Promociones
                </span>
                <h2 className="text-4xl font-bold mb-4">Ofertas Especiales</h2>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  Aprovechá nuestras promociones vigentes con los mejores tratamientos.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {promos.map((promo, i) => (
                  <motion.div
                    key={promo.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    viewport={{ once: true }}
                  >
                    <Card className="overflow-hidden border-none shadow-xl rounded-3xl bg-white h-full group hover:shadow-2xl transition-shadow duration-300">
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={promo.image_url || FALLBACK_PROMO_IMAGE}
                          alt={promo.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => { e.target.src = FALLBACK_PROMO_IMAGE; }}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" aria-hidden="true" />
                        {promo.promo_label && (
                          <div className="absolute top-4 right-4">
                            <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                              {promo.promo_label}
                            </span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-8">
                        <h3 className="text-2xl font-bold mb-3">{promo.name}</h3>
                        {promo.description && (
                          <p className="text-muted-foreground leading-relaxed mb-6">{promo.description}</p>
                        )}
                        <Button asChild className="w-full rounded-xl shadow-md hover:scale-[1.02] transition-transform">
                          <a href={`${BUSINESS.whatsapp}?text=Hola!%20Me%20interesa%20la%20promo%20${encodeURIComponent(promo.name)}`} target="_blank" rel="noopener noreferrer">
                            Consultar por WhatsApp
                            <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Testimonials (reseñas reales de Google) ──────────── */}
        <section aria-label="Reseñas de clientes" className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-50 text-yellow-700 text-sm font-semibold mb-4 border border-yellow-200">
                <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                4.9 · Reseñas reales de Google
              </div>
              <h2 className="text-4xl font-bold mb-4">Lo que dicen nuestras clientas</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Experiencias reales de quienes confían en Virginia Rojas Beauty en Belgrano
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <motion.article
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-primary/10 relative flex flex-col"
                  itemScope
                  itemType="https://schema.org/Review"
                >
                  <div className="flex gap-1 mb-3 text-yellow-500" aria-label={`${t.rating} estrellas`}>
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                  <p className="italic text-base mb-6 leading-relaxed flex-1" itemProp="reviewBody">"{t.text}"</p>
                  <div>
                    <p className="font-bold" itemProp="author">{t.name}</p>
                    <p className="text-xs text-primary font-medium mt-0.5">{t.service}</p>
                  </div>
                  <div className="absolute -top-4 -right-4 bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center -rotate-12" aria-hidden="true">
                    <Sparkle className="w-6 h-6 text-primary" />
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Dónde estamos (NAP section) ──────────────────────── */}
        <section id="contacto" aria-label="Ubicación y contacto" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Dónde encontrarnos</h2>
              <p className="text-muted-foreground text-lg">
                Salón de belleza en el corazón de Belgrano, CABA
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-center">
              {/* Contact info */}
              <address className="not-italic space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Dirección</p>
                    <p className="text-muted-foreground">Av. Juramento 1957</p>
                    <p className="text-muted-foreground">Belgrano, Ciudad Autónoma de Buenos Aires</p>
                    <a
                      href={BUSINESS.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm font-medium hover:underline mt-1 inline-block"
                    >
                      Ver en Google Maps →
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Teléfono / WhatsApp</p>
                    <a href={BUSINESS.phoneHref} className="text-muted-foreground hover:text-primary transition-colors">
                      +54 9 11 7074-2867
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Email</p>
                    <a href={`mailto:${BUSINESS.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                      {BUSINESS.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Instagram className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Instagram</p>
                    <a
                      href={BUSINESS.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      @virginiarojasbeautyy
                    </a>
                  </div>
                </div>
              </address>

              {/* Map card */}
              <a
                href={BUSINESS.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver Virginia Rojas Beauty en Google Maps"
                className="group block rounded-3xl overflow-hidden shadow-xl border border-primary/10 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                {/* Static map image via Google Maps Static API (no key needed for basic use) */}
                <div className="relative">
                  <img
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=Av+Juramento+1957,Belgrano,Buenos+Aires&zoom=16&size=600x400&markers=color:red%7CAv+Juramento+1957,Belgrano,Buenos+Aires&style=feature:poi|visibility:off&key=`}
                    alt="Ubicación Virginia Rojas Beauty en Belgrano"
                    className="w-full h-64 object-cover opacity-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  {/* Fallback visual siempre visible */}
                  <div className="flex flex-col items-center justify-center gap-6 py-16 px-8 text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <MapPin className="w-10 h-10 text-primary" aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-xl text-foreground">Virginia Rojas Beauty</p>
                      <p className="text-muted-foreground">Av. Juramento 1957</p>
                      <p className="text-muted-foreground">Belgrano, CABA</p>
                      <p className="text-sm text-muted-foreground">A pocas cuadras del subte D · Estación Juramento</p>
                    </div>
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold group-hover:bg-primary/90 transition-colors shadow-md">
                      <MapPin className="w-4 h-4" aria-hidden="true" />
                      Abrir en Google Maps
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section aria-label="Preguntas frecuentes" className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Preguntas Frecuentes</h2>
                <p className="text-muted-foreground text-lg">
                  Todo lo que necesitás saber sobre nuestro salón en Belgrano
                </p>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-primary/10 px-8 py-2">
                {faqs.map((faq, i) => (
                  <FAQItem key={i} q={faq.q} a={faq.a} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────── */}
        <section aria-label="Reservar turno" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-br from-primary/10 via-secondary to-accent/30 p-12 md:p-20 rounded-[3rem] text-center relative overflow-hidden group border border-primary/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/20 transition-colors" aria-hidden="true" />
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight text-foreground">
                  ¿Lista para brillar?
                </h2>
                <p className="text-muted-foreground text-xl mb-10 max-w-xl mx-auto">
                  Reservá tu turno en nuestro salón de Belgrano y dejá que realcemos tu belleza natural.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    asChild
                    className="h-16 px-12 text-xl rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                  >
                    <Link to={bookingHref}>Reservar Ahora</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="h-16 px-12 text-xl rounded-full border-foreground/20"
                  >
                    <a href={`${BUSINESS.whatsapp}?text=Hola!%20Quiero%20reservar%20un%20turno`} target="_blank" rel="noopener noreferrer">
                      Escribir por WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
