// ─── Heist — Mock WebSocket Service ──────────────────────────────────────────
// Simulates real-time Socket.io events for 4-player Heist gameplay.
// Events: lobby join/ready, heist action, reveal, summary, transfer, nemesis.
// Replace emit/on handlers with real socket.io-client when backend is ready.
// ─────────────────────────────────────────────────────────────────────────────

import type { HeistAction, RoundResult, TransferPayload } from '@game/game';
import { MOCK_LOBBY_PLAYERS } from '../data/mockData';

type EventCallback<T = any> = (data: T) => void;

// ── Event registry ────────────────────────────────────────────────────────────
const listeners: Record<string, EventCallback[]> = {};

function emit(event: string, data?: any) {
  (listeners[event] ?? []).forEach((cb) => cb(data));
}

// ─────────────────────────────────────────────────────────────────────────────
const HeistSocket = {
  // ── Subscribe ────────────────────────────────────────────────────────────
  on<T = any>(event: string, cb: EventCallback<T>) {
    if (!listeners[event]) { listeners[event] = []; }
    listeners[event].push(cb as EventCallback);
  },

  off(event: string, cb?: EventCallback) {
    if (!cb) { listeners[event] = []; return; }
    listeners[event] = (listeners[event] ?? []).filter((fn) => fn !== cb);
  },

  // ── Join Matchmaking ──────────────────────────────────────────────────────
  joinHeist() {
    emit('lobby:searching', {});
    const bots = MOCK_LOBBY_PLAYERS.filter((p) => !p.isLocal);
    let joined = 0;
    const fillInterval = setInterval(() => {
      if (joined >= bots.length) {
        clearInterval(fillInterval);
        emit('lobby:ready', { players: MOCK_LOBBY_PLAYERS });
        return;
      }
      const player = bots[joined];
      joined++;
      emit('lobby:player_joined', { player });
    }, 600);
  },

  // ── Player Ready Toggle ───────────────────────────────────────────────────
  setReady(playerId: string, isReady: boolean) {
    emit('lobby:player_ready', { playerId, isReady });
    if (isReady) {
      setTimeout(() => {
        MOCK_LOBBY_PLAYERS
          .filter((p) => !p.isLocal && !p.isReady)
          .forEach((p) => emit('lobby:player_ready', { playerId: p.id, isReady: true }));
        setTimeout(() => HeistSocket._startCountdown(), 500);
      }, 1000);
    }
  },

  // ── Countdown ─────────────────────────────────────────────────────────────
  _startCountdown() {
    [3, 2, 1].forEach((n, i) => {
      setTimeout(() => emit('game:countdown', { count: n }), i * 1000);
    });
    setTimeout(() => {
      emit('game:action_phase_start', {
        round: 1,
        lootType: 'cash',
        totalLoot: 2000,
        timer: 15,
      });
      HeistSocket._runActionTimer(15);
    }, 3000);
  },

  // ── Action Timer ──────────────────────────────────────────────────────────
  _timerHandle: null as ReturnType<typeof setInterval> | null,
  _currentTimer: 15,

  _runActionTimer(startSeconds: number) {
    if (HeistSocket._timerHandle) { clearInterval(HeistSocket._timerHandle); }
    HeistSocket._currentTimer = startSeconds;
    HeistSocket._timerHandle = setInterval(() => {
      HeistSocket._currentTimer -= 1;
      emit('game:timer_tick', { seconds: HeistSocket._currentTimer });
      if (HeistSocket._currentTimer <= 0) {
        clearInterval(HeistSocket._timerHandle!);
        HeistSocket._timerHandle = null;
        HeistSocket._triggerReveal();
      }
    }, 1000);
  },

  // ── Submit Action ─────────────────────────────────────────────────────────
  submitAction(playerId: string, action: HeistAction) {
    emit('game:action_submitted', { playerId, action });
    if (HeistSocket._timerHandle) {
      clearInterval(HeistSocket._timerHandle);
      HeistSocket._timerHandle = null;
    }
    setTimeout(() => HeistSocket._triggerReveal(action), 1200);
  },

  // ── Use Skill ─────────────────────────────────────────────────────────────
  useSkill(playerId: string, skillId: string) {
    emit('game:skill_used', { playerId, skillId, cooldown: 30 });
  },

  // ── Reveal Phase ──────────────────────────────────────────────────────────
  _triggerReveal(localAction: HeistAction = 'shield') {
    const actions: HeistAction[] = ['share', 'steal', 'steal', 'shield'];
    const results: RoundResult[] = MOCK_LOBBY_PLAYERS.map((player, idx) => {
      const action = player.isLocal ? localAction : (actions[idx] ?? 'share');
      const wasBetrayed = !player.isLocal && action === 'steal';
      return {
        playerId: player.id,
        playerName: player.name,
        avatar: player.avatar,
        action,
        moneyGained: action === 'steal' ? 450 : action === 'share' ? 300 : 100,
        moneyLost: wasBetrayed ? 200 : 0,
        wasBetrayed,
        usedSkill: false,
      };
    });
    emit('game:reveal', { results });
  },

  // ── Deposit to Vault ──────────────────────────────────────────────────────
  depositToVault(playerId: string, amount: number) {
    const fee = Math.floor(amount * 0.05);
    const deposited = amount - fee;
    emit('vault:deposited', { playerId, deposited, fee });
  },

  // ── Transfer Gold ─────────────────────────────────────────────────────────
  transferGold(payload: TransferPayload) {
    emit('transfer:sent', payload);
    setTimeout(() => {
      emit('transfer:received', {
        ...payload,
        notification: `💰 ${payload.toPlayerName} received ${payload.amount} Gold!`,
      });
    }, 800);
  },

  // ── Next Round ───────────────────────────────────────────────────────────
  startNextRound(round: number) {
    const lootTypes = ['cash', 'gold_bars', 'diamonds'] as const;
    const loot = lootTypes[round % lootTypes.length];
    emit('game:action_phase_start', {
      round,
      lootType: loot,
      totalLoot: 2000 + round * 200,
      timer: 15,
    });
    HeistSocket._runActionTimer(15);
  },

  // ── Nemesis Match ─────────────────────────────────────────────────────────
  findNemesisMatch(nemesisPlayerId: string) {
    emit('nemesis:searching', { nemesisPlayerId });
    setTimeout(() => {
      emit('nemesis:match_found', { nemesisPlayerId, roomId: `room_${Date.now()}` });
      HeistSocket.joinHeist();
    }, 2000);
  },

  // ── Disconnect ────────────────────────────────────────────────────────────
  disconnect() {
    if (HeistSocket._timerHandle) {
      clearInterval(HeistSocket._timerHandle);
      HeistSocket._timerHandle = null;
    }
    Object.keys(listeners).forEach((key) => { listeners[key] = []; });
  },
};

export default HeistSocket;
export const MockSocket = HeistSocket;
