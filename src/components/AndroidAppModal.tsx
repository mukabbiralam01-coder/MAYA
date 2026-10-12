/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  Volume2,
} from 'lucide-react';
import { VibeConfig } from '../types.ts';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface AndroidAppModalProps {
  isOpen: boolean;
  vibe: VibeConfig;
  onClose: () => void;
  onDownloadAndroidZip: () => void;
}

export const AndroidAppModal: React.FC<AndroidAppModalProps> = ({
  isOpen,
  vibe,
  onClose,
  onDownloadAndroidZip,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-lime-500/30 bg-slate-950/95 p-6 text-white shadow-2xl shadow-lime-500/10 overflow-hidden"
        style={{ borderColor: `${vibe.primary}66` }}
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: vibe.primary }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-lime-500/20 border border-lime-400/40 flex items-center justify-center shadow-lg shadow-lime-500/20">
            <Smartphone className="w-6 h-6 text-lime-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white">
                Zoya AI Ko Android App Banayein
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-lime-400/20 text-lime-300 border border-lime-400/30">
                PWA + APK
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Apne mobile par direct standalone app ki tarah install karein
            </p>
          </div>
        </div>

        {/* Status Banner */}
        {isInstalled ? (
          <div className="p-3.5 mb-5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 flex items-center gap-2.5 text-emerald-300 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">App Already Installed!</p>
              <p className="text-emerald-400/80 text-[11px]">
                Zoya pehle se aapke mobile par standalone app ki tarah chal rahi hai.
              </p>
            </div>
          </div>
        ) : null}

        {/* Method 1: Instant 1-Tap PWA Install (Direct on Phone) */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xs">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-lime-400 font-bold">
                  Tareeqa 1 (Sabse Aasan & Direct)
                </span>
                <h3 className="text-sm font-semibold text-white">
                  Mobile Home Screen Par Install Karein
                </h3>
              </div>
              <Sparkles className="w-4 h-4 text-lime-400 shrink-0" />
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Bina kisi computer ke, apne phone par Zoya ko as a native app save karein. Koi URL bar nahi dikhega aur Zoya fullscreen chalegi!
            </p>

            {isInstallable ? (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm bg-lime-400 hover:bg-lime-300 text-black transition-all shadow-lg shadow-lime-500/20 cursor-pointer active:scale-98"
              >
                <Smartphone className="w-4 h-4" />
                Abhi Phone Par Install Karein (1-Tap)
              </button>
            ) : (
              <div className="space-y-2 text-xs text-slate-300 bg-black/40 p-3 rounded-lg border border-white/5 font-mono">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-lime-400/20 text-lime-300 flex items-center justify-center shrink-0 text-[10px] font-bold">1</span>
                  <span>Mobile Chrome browser mein uper daayein kone mein <strong>3 Dots (⋮)</strong> dabayein.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-lime-400/20 text-lime-300 flex items-center justify-center shrink-0 text-[10px] font-bold">2</span>
                  <span><strong>&ldquo;Install app&rdquo;</strong> ya <strong>&ldquo;Add to Home screen&rdquo;</strong> par click karein.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-lime-400/20 text-lime-300 flex items-center justify-center shrink-0 text-[10px] font-bold">3</span>
                  <span>Zoya aapke phone ke app drawer aur home screen par aa jayegi!</span>
                </div>
              </div>
            )}
          </div>

          {/* Method 2: Android Studio Kotlin Project & APK ZIP */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Tareeqa 2 (Developer / Android Studio APK)
                </span>
                <h3 className="text-sm font-semibold text-white">
                  Android Project & APK Source Code ZIP
                </h3>
              </div>
              <Download className="w-4 h-4 text-cyan-400 shrink-0" />
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Full Kotlin project with native `CameraManager` torch, accelerometer motion sentry guard, and auto-granted Gemini mic permissions.
            </p>

            <div className="flex items-center gap-2">
              <a
                href="/api/download-android-zip"
                download="zoya-android-project.zip"
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-black transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Android ZIP (4.5 MB)
              </a>
              <button
                type="button"
                onClick={onDownloadAndroidZip}
                className="py-2 px-3 rounded-xl text-xs font-mono border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                Refresh ZIP
              </button>
            </div>
          </div>

          {/* Superpowers list */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <Volume2 className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
              <p className="text-[10px] font-mono text-slate-300">Duplex Voice</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <Flame className="w-4 h-4 mx-auto mb-1 text-amber-400" />
              <p className="text-[10px] font-mono text-slate-300">Torch & Vibrate</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-lime-400" />
              <p className="text-[10px] font-mono text-slate-300">Don&apos;t Touch Guard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
