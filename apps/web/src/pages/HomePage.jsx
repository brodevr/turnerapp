import React from 'react';
import { Link } from 'react-router-dom';
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
  Scissors,
  Sparkle,
  Gift,
  Eye
} from 'lucide-react';
import { useClientAuth } from '@/contexts/ClientAuthContext.jsx';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const { clientUser } = useClientAuth();
  const { t } = useTranslation();

  const services = [
    { title: "Limpieza Facial Profunda", desc: "Limpieza completa con extracción y nutrición para una piel renovada.", icon: Sparkles, image: "/images/facial-treatment.png" },
    { title: "Diseño de Cejas", desc: "Diseño personalizado con técnica de depilación con hilo o pinza.", icon: Eye, image: "/images/eyebrow-design.png" },
    { title: "Lifting de Pestañas", desc: "Curvatura natural y duradera para una mirada impactante.", icon: Heart, image: "/images/eyelash-lifting.png" },
    { title: "Tinte de Cejas", desc: "Color y definición para enmarcar tu mirada.", icon: Scissors, image: "/images/eyebrow-design.png" },
    { title: "Tinte de Pestañas", desc: "Oscurece tus pestañas para un efecto de máscara permanente.", icon: Eye, image: "/images/eyelash-lifting.png" },
    { title: "Laminado de Cejas", desc: "Alisado y fijación para cejas perfectamente peinadas.", icon: Sparkle, image: "/images/eyebrow-design.png" },
    { title: "Perfilado con Hilo", desc: "Técnica ancestral para una depilación precisa y delicada.", icon: Scissors, image: "/images/eyebrow-design.png" },
    { title: "Tratamiento Anti-Acné", desc: "Protocolo especializado para pieles con tendencia acneica.", icon: ShieldCheck, image: "/images/facial-treatment.png" },
    { title: "Hidratación Facial", desc: "Nutrición profunda para devolver luminosidad a tu piel.", icon: Sparkles, image: "/images/facial-treatment.png" },
    { title: "Combo Cejas + Pestañas", desc: "Diseño de cejas + lifting de pestañas para una mirada completa.", icon: Star, image: "/images/eyelash-lifting.png" },
  ];

  const promos = [
    {
      title: "Primera Visita -20%",
      desc: "En tu primer tratamiento facial, llevate un 20% de descuento. ¡Conocenos!",
      badge: "NUEVA CLIENTA",
      icon: Gift,
      image: "/images/promo-first-visit.png"
    },
    {
      title: "Combo Mirada Completa",
      desc: "Diseño de cejas + Lifting de pestañas + Tinte por un precio especial. Consultá por WhatsApp.",
      badge: "MÁS PEDIDO",
      icon: Star,
      image: "/images/promo-combo.png"
    }
  ];

  const testimonials = [
    {
      name: "Sophia Martinez",
      role: "Clienta Regular",
      text: "La atención al detalle es incomparable. No es solo un tratamiento, es una experiencia completa que me hace sentir renovada cada vez.",
      rating: 5
    },
    {
      name: "Isabella Chen",
      role: "Clienta Nueva",
      text: "Desde la primera sesión me sentí en confianza. Virginia es una profesional increíble y los resultados hablan por sí solos.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "Clienta Frecuente",
      text: "La reserva online es súper fácil y Virginia siempre es puntual. Perfecto para mi agenda ocupada sin comprometer la calidad.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Header />

      <main className="flex-1 overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center pt-16 bg-gradient-to-br from-secondary via-background to-accent/30">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
                <Sparkle className="w-4 h-4" />
                ✨ Cuidado facial, cejas y pestañas
              </span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1] text-foreground">
                Realza tu{' '}
                <span className="text-primary">belleza natural</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
                En Virginia Rojas Beauty nos especializamos en tratamientos faciales, diseño de cejas y realce de pestañas para resaltar tu belleza de forma natural y armoniosa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="h-14 px-10 text-lg rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                  <Link to={clientUser ? "/professionals" : "/identity"}>
                    Reservá tu turno
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-14 px-10 text-lg rounded-full border-foreground/20 hover:bg-foreground/5">
                  <a href="#services">Ver Servicios</a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Brand Promise Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              {[
                {
                  icon: ShieldCheck,
                  emoji: "🎓",
                  title: "Profesional certificada",
                  text: "Formación en Venezuela y Argentina con más de 5 años de experiencia."
                },
                {
                  icon: Heart,
                  emoji: "🧴",
                  title: "Productos profesionales",
                  text: "Materiales de calidad argentina. Productos seguros y profesionales para el cuidado de tu piel."
                },
                {
                  icon: Sparkles,
                  emoji: "✨",
                  title: "Atención personalizada",
                  text: "Cada rostro es único. Analizamos tu piel y tus cejas para lograr resultados naturales."
                }
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
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Nuestros Servicios</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Tratamientos pensados para realzar tu belleza de forma natural y cuidada.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {services.map((service, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Card className="group overflow-hidden border border-primary/5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 rounded-2xl bg-white h-full flex flex-col">
                    {/* Service Image */}
                    <div className="relative h-32 md:h-40 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg">
                        <service.icon className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    <CardContent className="p-4 md:p-5 flex flex-col flex-1 text-center">
                      <h3 className="text-sm md:text-base font-bold mb-2 leading-tight">{service.title}</h3>
                      <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-3 flex-1">
                        {service.desc}
                      </p>
                      <Button asChild variant="ghost" size="sm" className="w-full text-primary hover:bg-primary/5 text-xs mt-auto">
                        <Link to={clientUser ? "/professionals" : "/identity"}>
                          Reservar Turno
                          <ArrowRight className="ml-1 w-3 h-3" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Promos Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 border border-primary/20">
                <Gift className="w-4 h-4" />
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
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  viewport={{ once: true }}
                >
                  <Card className="overflow-hidden border-none shadow-xl rounded-3xl bg-white h-full group hover:shadow-2xl transition-shadow duration-300">
                    {/* Promo Image */}
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={promo.image}
                        alt={promo.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                          {promo.badge}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold mb-3">{promo.title}</h3>
                      <p className="text-muted-foreground leading-relaxed mb-6">{promo.desc}</p>
                      <Button asChild className="w-full rounded-xl shadow-md hover:scale-[1.02] transition-transform">
                        <a href="https://wa.me/5491170742867?text=Hola!%20Me%20interesa%20la%20promo" target="_blank" rel="noopener noreferrer">
                          Consultar por WhatsApp
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Lo que dicen nuestras clientas</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Experiencias reales de quienes confían en nosotras
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-primary/10 relative"
                >
                  <div className="flex gap-1 mb-4 text-primary">
                    {[...Array(testimonial.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="italic text-lg mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-primary font-medium">{testimonial.role}</p>
                  </div>
                  <div className="absolute -top-4 -right-4 bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center -rotate-12">
                    <Sparkle className="w-6 h-6 text-primary" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Strip */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-br from-primary/10 via-secondary to-accent/30 p-12 md:p-20 rounded-[3rem] text-center relative overflow-hidden group border border-primary/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/20 transition-colors" />
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight text-foreground">¿Lista para brillar?</h2>
                <p className="text-muted-foreground text-xl mb-10 max-w-xl mx-auto">
                  Reservá tu turno y dejá que realcemos tu belleza natural.
                </p>
                <Button size="lg" asChild className="h-16 px-12 text-xl rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                  <Link to={clientUser ? "/professionals" : "/identity"}>Reservar Ahora</Link>
                </Button>
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
