"use client";

import Image from "next/image";

interface PlayerCardProps {
  name: string;
  title?: string;
  company?: string;
  companyLogo?: string;
  headshot?: string;
  archetype: string;
  tagline: string;
  className?: string;
}

export function PlayerCard({
  name,
  title,
  company,
  companyLogo,
  headshot,
  archetype,
  tagline,
  className = "",
}: PlayerCardProps) {
  const displayName = name.toUpperCase();

  return (
    <div className={`relative w-[320px] ${className}`}>
      <div className="bg-card-bg rounded-2xl overflow-hidden border border-card-border shadow-2xl">
        {/* Green header banner */}
        <div className="bg-green px-4 py-3">
          <p className="text-black text-xs font-bold tracking-wide text-center">
            {displayName}&apos;S CONTENT TEAM
          </p>
          <p className="text-black text-lg font-black text-center tracking-tight">
            WINS AI SEARCH
          </p>
        </div>

        {/* Card body */}
        <div className="p-5">
          {/* Headshot */}
          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-card-border mb-4">
            {headshot ? (
              <Image
                src={headshot}
                alt={name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green/20 to-green/5">
                <span className="text-6xl font-bold text-green/30">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Company logo */}
          {companyLogo && (
            <div className="flex justify-center mb-3">
              <Image
                src={companyLogo}
                alt={company || "Company"}
                width={100}
                height={30}
                className="h-6 w-auto object-contain opacity-70"
              />
            </div>
          )}

          {/* Archetype result */}
          <div className="text-center mb-3">
            <p className="text-text-muted text-sm mb-1">Your archetype:</p>
            <h3 className="text-green text-2xl font-black">{archetype}</h3>
            <p className="text-white text-sm italic">&quot;{tagline}&quot;</p>
          </div>

          {/* User info */}
          {(title || company) && (
            <div className="text-center text-sm text-text-muted border-t border-card-border pt-3">
              {title && <p>{title}</p>}
              {company && <p>{company}</p>}
            </div>
          )}
        </div>

        {/* Footer branding */}
        <div className="bg-black/50 px-4 py-3 border-t border-card-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-xs font-bold">airOps</p>
              <p className="text-text-muted text-[10px]">MARKETING TEAMS WIN HERE</p>
            </div>
            <p className="text-green text-xs font-medium">airops.com/win</p>
          </div>
        </div>
      </div>
    </div>
  );
}
