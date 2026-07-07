'use client';

import { useState, useCallback } from 'react';
import type { RosterSlot } from '@/types';
import { FIGHTER_COLORS } from '@/data/constants';
import { ABILITY_DEFS } from '@/data/abilityDefs';

interface RosterBuilderProps { onStart: (slots: RosterSlot[]) => void; }

function generateId() { return Math.random().toString(36).slice(2,9); }
function makeSlot(index: number): RosterSlot {
  return { id:generateId(), name:`플레이어 ${index+1}`, color:FIGHTER_COLORS[index%FIGHTER_COLORS.length], imageUrl:null };
}
function makeSlots(n: number): RosterSlot[] { return Array.from({length:n},(_,i)=>makeSlot(i)); }

export default function RosterBuilder({ onStart }: RosterBuilderProps) {
  const [count, setCount] = useState(4);
  const [slots, setSlots] = useState<RosterSlot[]>(()=>makeSlots(4));

  const changeCount=(n:number)=>{
    setCount(n);
    setSlots(prev=>n>prev.length?[...prev,...Array.from({length:n-prev.length},(_,i)=>makeSlot(prev.length+i))]:prev.slice(0,n));
  };
  const updateSlot=useCallback((id:string,patch:Partial<RosterSlot>)=>setSlots(prev=>prev.map(s=>s.id===id?{...s,...patch}:s)),[]);
  const handleImageUpload=useCallback((id:string,file:File)=>updateSlot(id,{imageUrl:URL.createObjectURL(file)}),[updateSlot]);

  const autoAbs=ABILITY_DEFS.filter(a=>a.type==='auto');
  const collAbs=ABILITY_DEFS.filter(a=>a.type==='collision');

  return(
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-widest text-yellow-400 drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]">⚔️ BATTLE ROYALE</h1>
        <p className="text-xs text-gray-500 mt-1 tracking-widest uppercase">simulator</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">참가 인원 선택</p>
        <div className="flex flex-wrap gap-2">
          {Array.from({length:15},(_,i)=>i+2).map(n=>(
            <button key={n} onClick={()=>changeCount(n)} className={`w-10 h-10 rounded-lg border text-sm font-bold transition-all ${count===n?'border-yellow-400 bg-yellow-400/10 text-yellow-400 shadow-[0_0_10px_rgba(255,215,0,.3)]':'border-gray-700 bg-gray-900 text-gray-500 hover:border-gray-500 hover:text-gray-300'}`}>{n}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">로스터 설정</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {slots.map((slot,idx)=>(
            <div key={slot.id} className="flex items-center gap-3 bg-gray-900 border rounded-lg p-3 transition-all" style={{borderColor:slot.color+'55'}}>
              <label className="cursor-pointer flex-shrink-0">
                <div className="w-12 h-12 rounded-full border-2 overflow-hidden flex items-center justify-center bg-gray-800 hover:opacity-80" style={{borderColor:slot.color}}>
                  {slot.imageUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ?<img src={slot.imageUrl} alt={slot.name} className="w-full h-full object-cover"/>
                    :<span className="text-2xl select-none">{['⚔️','🗡️','🥋','🌀','🦾','💪','🤛','👊','🥊','🦶','🤺','🛡️','🏹','🔱','⚡','🔥'][idx%16]}</span>}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)handleImageUpload(slot.id,f);}}/>
              </label>
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <input type="text" value={slot.name} onChange={e=>updateSlot(slot.id,{name:e.target.value})} maxLength={20} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="이름 입력"/>
                <div className="flex items-center gap-2">
                  <input type="color" value={slot.color} onChange={e=>updateSlot(slot.id,{color:e.target.value})} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"/>
                  <span className="text-[10px] text-gray-600">테두리 색상</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">능력 목록 (경기마다 랜덤 배분)</p>
        <div className="flex flex-col gap-2">
          <div><p className="text-[10px] text-gray-600 mb-1">자동 발동형</p><div className="flex flex-wrap gap-1">{autoAbs.map(ab=><span key={ab.id} className="text-[10px] px-2 py-0.5 rounded" style={{background:ab.color+'22',color:ab.color,border:`1px solid ${ab.color}44`}}>{ab.emoji} {ab.name}</span>)}</div></div>
          <div><p className="text-[10px] text-gray-600 mb-1">충돌 발동형</p><div className="flex flex-wrap gap-1">{collAbs.map(ab=><span key={ab.id} className="text-[10px] px-2 py-0.5 rounded" style={{background:ab.color+'22',color:ab.color,border:`1px solid ${ab.color}44`}}>{ab.emoji} {ab.name}</span>)}</div></div>
        </div>
      </div>
      <button onClick={()=>{if(slots.some(s=>!s.name.trim()))return;onStart(slots);}} disabled={slots.some(s=>!s.name.trim())} className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-lg tracking-wide transition-all active:scale-95">⚔️ 전투 시작!</button>
    </div>
  );
}
