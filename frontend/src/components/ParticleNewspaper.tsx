"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';

// Define the content and its layout
const contentConfig = {
  header: {
    line1: "AI NEWS",
    line2: "DETECTOR",
    x: 0.5,
    y: 0.40,
    baseSize: 100, // Increased size significantly to make it bold and huge
    baseColor: 'rgba(255, 255, 255, 1)',
    interactionRadius: 80, // Reduced from 220 to prevent blowing out too much text
  },
};

const ParticleNewspaper = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const mouse = useRef<{ x: number | null, y: number | null }>({ x: null, y: null });

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      setWindowSize({ width: offsetWidth, height: offsetHeight });
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !windowSize.width) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = windowSize.width;
    canvas.height = windowSize.height;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let newspaperImage = new Image();
    newspaperImage.src = '/newspaper_texture.png'; 
    let hasTexture = false;

    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      baseSize: number;
      size: number;
      baseColor: string;
      color: string;
      interactionRadius: number;
      isBackground: boolean;
      density: number;

      constructor(x: number, y: number, color: string, baseSize: number, interactionRadius: number, isBackground: boolean) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.baseSize = baseSize;
        this.size = baseSize;
        this.baseColor = color;
        this.color = color;
        this.interactionRadius = interactionRadius;
        this.isBackground = isBackground;
        
        // Background particles move less aggressively, foreground reduced significantly
        this.density = isBackground ? (Math.random() * 8) + 2 : (Math.random() * 15) + 5; 
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2); 
        ctx.fill();
      }

      update(mousePos: { x: number | null, y: number | null }) {
        let dx = 0;
        let dy = 0;
        let distance = 1000;
        if (mousePos.x !== null && mousePos.y !== null) {
          dx = mousePos.x - this.x;
          dy = mousePos.y - this.y;
          distance = Math.sqrt(dx * dx + dy * dy);
        }

        let forceDirectionX = distance > 0 ? dx / distance : 0;
        let forceDirectionY = distance > 0 ? dy / distance : 0;

        if (distance < this.interactionRadius) {
          this.size = this.isBackground ? this.baseSize * 1.2 : this.baseSize * 1.8; 
          this.color = this.isBackground ? 'rgba(150, 150, 150, 0.8)' : this.baseColor.replace(', 1)', ', 0.6)');

          let force = (this.interactionRadius - distance) / this.interactionRadius;
          let noise = this.isBackground ? 2 : 5;
          let directionX = forceDirectionX * force * this.density + (Math.random() - 0.5) * noise;
          let directionY = forceDirectionY * force * this.density + (Math.random() - 0.5) * noise;
          
          this.x -= directionX;
          this.y -= directionY;
        } else {
          this.size = Math.max(this.size * 0.96, this.baseSize);
          this.color = this.baseColor;

          if (this.x !== this.baseX) {
            this.x -= (this.x - this.baseX) / 8; // Snap back faster (was 15)
          }
          if (this.y !== this.baseY) {
            this.y -= (this.y - this.baseY) / 8; // Snap back faster
          }
        }
      }
    }

    const init = () => {
      particles = [];
      const textCanvas = document.createElement('canvas');
      textCanvas.width = canvas.width;
      textCanvas.height = canvas.height;
      const textCtx = textCanvas.getContext('2d');
      if (!textCtx) return;
      const baseScale = Math.min(canvas.width / 1440, 1.5) || 1; 

      //==================================================
      // PASS 1: Generate Main Text
      //==================================================
      textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
      
      const renderTextToPixels = (text: string, config: any, fontSize: number, isMainTitle: boolean) => {
        textCtx.font = `${isMainTitle ? '900' : '600'} ${fontSize}px "Arial Black", Impact, sans-serif`;
        textCtx.textAlign = 'center';
        textCtx.textBaseline = 'middle';
        textCtx.fillStyle = 'white';
        
        const lines = text.split('\n');
        const lineHeight = fontSize * 1.1; 
        const baseY = canvas.height * config.y - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, index) => {
          textCtx.fillText(line, canvas.width * config.x, baseY + index * lineHeight);
        });
      };

      // Main Title
      renderTextToPixels(`${contentConfig.header.line1}\n${contentConfig.header.line2}`, contentConfig.header, contentConfig.header.baseSize * baseScale, true);

      let fgData = textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height);
      let fgGap = canvas.width < 768 ? 3 : 4; 

      for (let y = 0; y < fgData.height; y += fgGap) {
        for (let x = 0; x < fgData.width; x += fgGap) {
          if (fgData.data[(y * 4 * fgData.width) + (x * 4) + 3] > 128) {
            
            let currentConfig = contentConfig.header;

            particles.push(
              new Particle(
                x, y,
                currentConfig.baseColor,
                currentConfig.baseSize * 0.08 * baseScale, 
                currentConfig.interactionRadius * baseScale,
                false
              )
            );
          }
        }
      }

      //==================================================
      // PASS 2: Generate Newspaper Background Columns
      //==================================================
      textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
      textCtx.fillStyle = 'white'; 
      textCtx.textAlign = 'left';
      textCtx.textBaseline = 'top';
      
      const columnWidth = 380 * baseScale;
      const columnGap = 40 * baseScale;
      const startX = 30 * baseScale;
      const startY = 30 * baseScale;
      let numColumns = Math.floor((canvas.width - startX) / (columnWidth + columnGap));
      if(numColumns <= 0) numColumns = 1;

      const bgFontSize = 24 * baseScale; // Significantly increased size so letters are composed of more particles
      textCtx.font = `bold ${bgFontSize}px Arial, sans-serif`; // Changed to bold sans-serif for blockier, more readable pixels
      
      const dummyTexts = [
        "BREAKING: Extraterrestrial spacecraft lands in Central Park! Mayor welcomes alien delegation as thousands gather to watch the flying saucer.",
        "URGENT: Zombie apocalypse outbreak confirmed in downtown Miami! CDC issues level 4 quarantine and advises citizens to board up windows.",
        "Global markets rally as new economic data shows inflation cooling down significantly. Several central banks signal potential rate cuts.",
        "World leaders shocked: President admits to being replaced by a sophisticated AI robot during a live television broadcast.",
        "Space agencies successfully launch updated modular satellites, achieving unprecedented orbital maneuverability and expanding global internet.",
        "Mutant giant alligators spotted swimming through New York subway systems, transit authorities forced to shut down all major train lines."
      ];

      for (let c = 0; c < numColumns + 1; c++) {
        let cx = startX + c * (columnWidth + columnGap);
        let cy = startY;
        
        let textIndex = c % dummyTexts.length; 

        while (cy < canvas.height) {
          let line = dummyTexts[textIndex];
          
          let wrappedWords = line.split(" ");
          let tempString = "";
          
          for(let i=0; i<wrappedWords.length; i++) {
             if (textCtx.measureText(tempString + wrappedWords[i] + " ").width > columnWidth) {
                textCtx.fillText(tempString, cx, cy);
                cy += bgFontSize * 1.5; 
                tempString = wrappedWords[i] + " ";
             } else {
                tempString += wrappedWords[i] + " ";
             }
          }
          if (tempString) {
             textCtx.fillText(tempString, cx, cy);
             cy += bgFontSize * 1.5;
          }

          cy += bgFontSize * 0.5;
          textIndex = (textIndex + 1) % dummyTexts.length;
        }
      }

      let bgData = textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height);
      let bgGap = canvas.width < 768 ? 3 : 4; // Tighter gap for crisp, readable serif text 

      for (let y = 0; y < bgData.height; y += bgGap) {
        for (let x = 0; x < bgData.width; x += bgGap) {
          if (bgData.data[(y * 4 * bgData.width) + (x * 4) + 3] > 128) {
            
            // Mask out background particles that overlap with the foreground text
            let isOverlapping = false;
            // Check a padding radius around the point in the foreground mask
            let pad = 6; 
            for(let py = Math.max(0, y - pad); py <= Math.min(canvas.height-1, y + pad) && !isOverlapping; py++) {
               for(let px = Math.max(0, x - pad); px <= Math.min(canvas.width-1, x + pad) && !isOverlapping; px++) {
                  if (fgData.data[(py * 4 * fgData.width) + (px * 4) + 3] > 32) {
                     isOverlapping = true;
                  }
               }
            }

            if (!isOverlapping) {
              // Increased particle brightness and slightly tweaked size for readability
              particles.push(new Particle(x, y, 'rgba(215, 215, 215, 0.95)', bgFontSize * 0.08, 60 * baseScale, true));
            }
          }
        }
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (hasTexture) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(newspaperImage, 0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'screen'; 
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      particles.forEach(p => {
        p.update(mouse.current);
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    newspaperImage.onload = () => {
      hasTexture = true;
      init();
      animate();
    };

    newspaperImage.onerror = () => {
      hasTexture = false; 
      init();
      animate();
    };

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [windowSize]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mouse.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseLeave = () => {
    mouse.current = { x: null, y: null };
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center -mt-20" 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-10 cursor-crosshair" />
      <div className="absolute opacity-0 pointer-events-none font-bold" style={{fontFamily: 'Arial Black, Impact, sans-serif'}}>Loading fonts...</div>
    </div>
  );
};

export default ParticleNewspaper;
