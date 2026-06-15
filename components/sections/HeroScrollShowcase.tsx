"use client";
import React from "react";
import Image from "next/image";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export function HeroScrollShowcase() {
  return (
    <div className="flex flex-col overflow-hidden bg-[#080808]">
      <ContainerScroll
        titleComponent={
          <div className="mb-6">
            <p className="text-[#00ff87] text-xs tracking-[0.3em] uppercase font-mono mb-4">
              01 · Portfolio Preview
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Engineering that
              <br />
              <span className="text-[#00ff87]">moves vehicles forward</span>
            </h2>
            <p className="text-[#a3a3a3] text-base sm:text-lg max-w-xl mx-auto">
              Scroll to explore a decade of automotive software, validation systems, and embedded engineering.
            </p>
          </div>
        }
      >
        <Image
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=80"
          alt="Automotive engineering dashboard"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-top"
          draggable={false}
          unoptimized
        />
      </ContainerScroll>
    </div>
  );
}
