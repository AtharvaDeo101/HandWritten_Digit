"use client"

import { useEffect } from "react"
import { DigitCanvas } from "@/components/DigitCanvas"

export default function Home() {
  useEffect(() => {
    // Mouse Blob Follower
    const blob = document.getElementById("cursor-blob")
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX
      const y = e.clientY
      if (blob) {
        blob.style.transform = `translate(${x - 200}px, ${y - 200}px)`
      }
    }
    document.addEventListener("mousemove", handleMouseMove)

    // Parallax Effect
    const handleScroll = () => {
      const scroll = window.pageYOffset

      // Hero parallax
      const parallaxTexts = document.querySelectorAll(".parallax-text")
      parallaxTexts.forEach((text) => {
        const speed = text.getAttribute("data-speed")
        if (speed) {
          ;(text as HTMLElement).style.transform = `translateX(${scroll * Number.parseFloat(speed) * 0.1}px)`
        }
      })

      const heroImg = document.getElementById("hero-img")
      if (heroImg) {
        heroImg.style.transform = `translate(-50%, calc(-50% + ${scroll * 0.2}px)) scale(${1 + scroll * 0.0005})`
      }

      // Floating labels in project section
      const labels = document.querySelectorAll(".floating-label")
      labels.forEach((label, index) => {
        const direction = index % 2 === 0 ? 1 : -1
        ;(label as HTMLElement).style.transform = `translateY(${scroll * 0.1 * direction}px)`
      })
    }
    window.addEventListener("scroll", handleScroll)

    // Simple reveal on enter (Intersection Observer)
    const observerOptions = {
      threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active")
        }
      })
    }, observerOptions)

    document.querySelectorAll(".reveal-text").forEach((text) => {
      observer.observe(text)
    })

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault()
        const href = (this as HTMLAnchorElement).getAttribute("href")
        if (href) {
          document.querySelector(href)?.scrollIntoView({
            behavior: "smooth",
          })
        }
      })
    })

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("scroll", handleScroll)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <div className="blob" id="cursor-blob"></div>

      <nav>
        <div className="logo">Digit Vision</div>
        <ul className="nav-links">
          <li>
            <a href="#work">Work</a>
          </li>
          <li>
            <a href="#studio">Studio</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
        </ul>
        
      </nav>

      <main>
        {/* HERO SECTION */}
        <section id="hero">
          <img
            src="/images/digit-hero.jpg"
            alt="Handwritten digits with neural network visualization"
            className="hero-img"
            id="hero-img"
          />
          <div className="hero-title-container container">
            <span className="huge-type parallax-text" data-speed="-2">
              Draw
            </span>
            <span className="huge-type outline-text parallax-text" data-speed="2" style={{ paddingLeft: "200px" }}>
              Future
            </span>
          </div>
        </section>

        {/* INTRO */}
        <section id="about">
          <div className="container">
            <div style={{ maxWidth: "800px" }}>
              <h2
                style={{
                  fontSize: "3rem",
                  fontFamily: "var(--syne)",
                  marginBottom: "40px",
                }}
              >
                WE BUILD HANDWRITTEN DIGIT RECOGIZATION SYSTEM.
              </h2>
              <p
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 300,
                  color: "#888",
                }}
              >
                A CNN-powered system for handwritten digit recognition.It accurately predicts numbers from user-drawn input.
              </p>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="scrolling-marquee">
          <div className="marquee-inner">
            <span className="huge-type outline-text">DIGIT VISION — FOR BEST - PREDICTION </span>
            <span className="huge-type outline-text">DIGIT VISION — FOR BEST - PREDICTION </span>
          </div>
        </div>

        {/* WORK SECTION */}
        <section id="work" className="container">
          <div className="sticky-type">PREDICT</div>

          {/* Project 1 */}
          <div className="project-row">
            <div className="project-info">
              <span style={{ fontFamily: "var(--syne)", color: "var(--accent)" }}>001 / Work</span>
              <h3 className="huge-type" style={{ fontSize: "6rem", margin: "20px 0" }}>
                About
              </h3>
              <p>
                This project implements a custom neural network with two convolution layers and two hidden layers. It performs handwritten digit recognition with high accuracy.
              </p>
              <div className="divider"></div>
  
            </div>
            <div className="project-media">
              <img
                src="/images/digit-ai.jpg"
                alt="Neural network visualization with handwritten digit"
                className="project-image"
              />
              <div className="floating-label huge-type outline-text" style={{ fontSize: "8rem" }}>
                Dataset
              </div>
            </div>
          </div>

          {/* Project 2 */}
          <div className="project-row" style={{ flexDirection: "row-reverse" }}>
            <div className="project-info">
              <span style={{ fontFamily: "var(--syne)", color: "var(--accent)" }}>002 / Source</span>
              <h3 className="huge-type" style={{ fontSize: "6rem", margin: "20px 0" }}>
                DATASET
              </h3>
              <p>
                CNN model is trained on MNIST dataset for high-accuracy handwritten digit prediction. MNIST is a dataset of 70,000 small black-and-white images of handwritten digits (0–9), commonly used to train and test basic image recognition models.
              </p>
              <div className="divider"></div>
            </div>
            <div className="project-media">
              <img
                src="/images/digit-dataset.jpg"
                alt="MNIST handwritten digit grid"
                className="project-image"
              />
 
            </div>
          </div>
        </section>

        {/* DIGIT DRAWING SECTION */}
        <section id= "studio" style={{ padding: "100px 0" }}>
          <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <DigitCanvas />
          </div>
        </section>

        {/* OVERLAPPING COMPOSITION SECTION */}
        <section>
          <div className="container composition">
            <div className="comp-item-1">
              <img
                src="/images/digit-canvas.jpg"
                className="comp-image"
                alt="Digital drawing canvas with handwritten digit"
              />
            </div>
            <div className="comp-item-2">
              <img
                src="/images/digit-prediction.jpg"
                className="comp-image"
                alt="Digit prediction with confidence visualization"
              />
            </div>

            <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "400px",
                  zIndex: 10,
                }}
              >
              <img
                src="/images/digit-hero.jpg"
                className="comp-image"
                alt="Handwritten digits neural network visualization"
              />
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer id="contact">
          <div className="container">
            <div className="footer-cta">
              <p>Draw It.</p>
              <p>Know It.</p>
            </div>
            <div className="divider"></div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "var(--syne)",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                color: "#555",
              }}
            >
              
              <div style={{ display: "flex", gap: "30px" }}>
                <a href="https://www.instagram.com/atharvasayshelo/">INSTAGRAM</a>
                <a href="https://github.com/AtharvaDeo101">GITHUB</a>
                <a href="https://www.linkedin.com/in/atharva-deo-454248320?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app">LINKEDIN</a>
              </div>
              <div>LOCATED IN PUNE</div>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
