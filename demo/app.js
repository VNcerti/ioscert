// components/particles-config.js
export function initParticles() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    
    particlesJS("particles-js", {
      "particles": {
        "number": {
          "value": 150,
          "density": {
            "enable": true,
            "value_area": 800
          }
        },
        "color": {
          "value": currentTheme === 'dark' ? "#ffffff" : "#000000"
        },
        "shape": {
          "type": "circle",
          "stroke": {
            "width": 0,
            "color": currentTheme === 'dark' ? "#000000" : "#000000"
          }
        },
        "opacity": {
          "value": 0.3,
          "random": true
        },
        "size": {
          "value": 2,
          "random": true
        },
        "line_linked": {
          "enable": true,
          "distance": 140,
          "color": currentTheme === 'dark' ? "#ffffff" : "#000000",
          "opacity": 0.2,
          "width": 1
        },
        "move": {
          "enable": true,
          "speed": 1.2,
          "direction": "none",
          "random": true,
          "straight": false,
          "out_mode": "out",
          "bounce": false
        }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": {
            "enable": true,
            "mode": "repulse"
          },
          "onclick": {
            "enable": false
          },
          "resize": true
        },
        "modes": {
          "repulse": {
            "distance": 70,
            "duration": 0.4
          }
        }
      },
      "retina_detect": true
    });
  }
  
  export function updateParticlesTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    
    if (window.pJSDom && window.pJSDom.length > 0) {
      const pJS = window.pJSDom[0].pJS;
      
      if (currentTheme === 'dark') {
        pJS.particles.color.value = "#ffffff";
        pJS.particles.line_linked.color = "#ffffff";
        pJS.particles.line_linked.opacity = 0.2;
      } else {
        pJS.particles.color.value = "#000000";
        pJS.particles.line_linked.color = "#000000";
        pJS.particles.line_linked.opacity = 0.2;
      }
      
      pJS.fn.particlesRefresh();
    }
  }
