# 🤖 RL Trading System v1.0

**KI-gesteuertes Trading mit Reinforcement Learning**

Ein vollständiges Reinforcement Learning System für automatisiertes Trading auf 1-Minuten-Charts mit Multi-Objektiv Reward-Funktion, die sowohl Profit als auch Trade-Frequenz optimiert.

## 🎯 Features

### ✨ Kernfunktionen
- **Multi-Objektiv Optimization**: Profit + Trade-Frequenz + Sharpe Ratio + Drawdown Management
- **15 Technische Indikatoren**: Vollständig konfigurierbar und erweiterbar
- **Mehrere RL-Algorithmen**: PPO, DQN, A2C, SAC
- **Live SL/TP Management**: Automatische Stop-Loss und Take-Profit Ausführung
- **Multi-Asset Support**: Crypto (Binance), Stocks (Yahoo/Alpaca), Forex
- **Hyperparameter-Optimierung**: Automatisch mit Optuna
- **Real-time Backtesting**: Vollständige Simulation mit Transaktionskosten

### 📊 Unterstützte Märkte
- **Crypto**: Binance API (kostenlos, 24/7 verfügbar)
- **Stocks**: Yahoo Finance + Alpaca Paper Trading (kostenlos)
- **Forex**: Über verschiedene APIs erweiterbar

### 🧠 RL-Algorithmen
- **PPO (Proximal Policy Optimization)**: Empfohlen für Trading
- **DQN (Deep Q-Network)**: Für diskrete Aktionen
- **A2C (Advantage Actor-Critic)**: Schnelles Training
- **SAC (Soft Actor-Critic)**: Für kontinuierliche Aktionen

## 📋 Systemanforderungen

### Software
- **Python**: 3.8+
- **RAM**: Mindestens 8GB (16GB empfohlen)
- **CPU**: Multicore empfohlen für Hyperparameter-Optimierung
- **GPU**: Optional (für größere Netzwerke)

### APIs (alle kostenlos)
- **Binance**: Keine API-Keys für historische Daten nötig
- **Yahoo Finance**: Kostenlos für Aktien
- **Alpaca**: Kostenlose Paper-Trading API
- **News API**: Optional für Nachrichtendaten

## 🚀 Installation

### 1. Repository klonen
```bash
git clone <repository-url>
cd rl-trading-system
```

### 2. Python Environment
```bash
# Conda (empfohlen)
conda create -n trading-rl python=3.9
conda activate trading-rl

# Oder virtualenv
python -m venv trading-rl
source trading-rl/bin/activate  # Linux/Mac
trading-rl\Scripts\activate     # Windows
```

### 3. Dependencies installieren
```bash
pip install -r requirements.txt
```

### 4. Optional: API Keys konfigurieren
```bash
# .env Datei erstellen
touch .env

# API Keys hinzufügen (optional)
echo "ALPACA_API_KEY=your_key_here" >> .env
echo "ALPACA_SECRET_KEY=your_secret_here" >> .env
echo "NEWS_API_KEY=your_news_key_here" >> .env
```

## 📚 Schnellstart

### 1. System testen
```bash
# Alle Komponenten testen
python main.py test --symbol BTCUSDT --data-source binance

# Einzelne Komponenten
python main.py test --component data --symbol AAPL --data-source yahoo
python main.py test --component indicators
python main.py test --component environment
```

### 2. Erstes Training starten
```bash
# Einfaches Training (5k Timesteps für schnellen Test)
python main.py train --symbols BTCUSDT --timesteps 5000

# Vollständiges Training
python main.py train --symbols BTCUSDT --timesteps 100000 --algorithm PPO
```

### 3. Hyperparameter optimieren
```bash
# Automatische Optimierung (20 Trials)
python main.py optimize --symbol BTCUSDT --trials 20 --timeout 3600
```

### 4. Backtest durchführen
```bash
# Modell backtesten
python main.py backtest --model models/best_BTCUSDT_PPO.zip --symbol BTCUSDT --episodes 10
```

## 🔧 Detaillierte Nutzung

### Training-Modi

#### Einzelsymbol Training
```bash
python main.py train \
    --symbols BTCUSDT \
    --algorithm PPO \
    --timesteps 100000 \
    --data-source binance
```

#### Multi-Symbol Training
```bash
python main.py train \
    --symbols BTCUSDT ETHUSDT ADAUSDT \
    --algorithm PPO \
    --timesteps 50000 \
    --multiprocessing
```

#### Algorithmen-Vergleich
```bash
# PPO Training
python main.py train --symbols BTCUSDT --algorithm PPO --timesteps 50000

# DQN Training
python main.py train --symbols BTCUSDT --algorithm DQN --timesteps 50000

# A2C Training
python main.py train --symbols BTCUSDT --algorithm A2C --timesteps 50000
```

### Hyperparameter-Optimierung

```bash
# Vollständige Optimierung
python main.py optimize \
    --symbol BTCUSDT \
    --algorithm PPO \
    --trials 50 \
    --timeout 7200

# Schnelle Optimierung
python main.py optimize \
    --symbol BTCUSDT \
    --trials 10 \
    --timeout 1800
```

### Backtesting

```bash
# Basis Backtest
python main.py backtest \
    --model models/best_BTCUSDT_PPO.zip \
    --symbol BTCUSDT \
    --episodes 20

# Verschiedene Märkte
python main.py backtest \
    --model models/best_AAPL_PPO.zip \
    --symbol AAPL \
    --data-source yahoo \
    --episodes 10
```

### Live Trading (Simulation)

```bash
# Dry Run (empfohlen für Tests)
python main.py live \
    --model models/best_BTCUSDT_PPO.zip \
    --symbol BTCUSDT \
    --dry-run \
    --duration 120

# Echtes Trading (Vorsicht!)
python main.py live \
    --model models/best_BTCUSDT_PPO.zip \
    --symbol BTCUSDT \
    --duration 60
```

## ⚙️ Konfiguration

### Trading Parameter anpassen

Erstelle `config/custom_config.json`:
```json
{
  "trading": {
    "initial_balance": 10000.0,
    "max_position_size": 0.3,
    "min_position_size": 0.05,
    "transaction_cost": 0.001,
    "max_drawdown": 0.15,
    "target_trades_per_day": 10,
    "profit_weight": 1.0,
    "trade_frequency_weight": 0.2,
    "sharpe_weight": 0.1,
    "drawdown_penalty": -0.5
  },
  "model": {
    "total_timesteps": 100000,
    "learning_rate": 0.0003,
    "batch_size": 64
  }
}
```

Konfiguration nutzen:
```bash
python main.py train --config config/custom_config.json --symbols BTCUSDT
```

### Eigene Indikatoren hinzufügen

Erstelle `indicators/my_indicators.json`:
```json
{
  "indicator_1": {
    "name": "custom_rsi",
    "period": 14,
    "parameters": {...}
  },
  "indicator_2": {
    "name": "custom_macd",
    "fast": 12,
    "slow": 26,
    "signal": 9
  },
  ...
}
```

Nutzen:
```bash
python main.py train --indicators indicators/my_indicators.json --symbols BTCUSDT
```

## 📊 Monitoring & Analyse

### TensorBoard
```bash
# TensorBoard starten
tensorboard --logdir logs/

# Im Browser öffnen
http://localhost:6006
```

### Logs analysieren
```bash
# Training Logs
tail -f trading_system.log

# Specific Symbol Logs
grep "BTCUSDT" trading_system.log

# Error Logs
grep "ERROR" trading_system.log
```

### Ergebnisse auswerten
```bash
# Training Results
cat results/final_results_*.json

# Model Performance
python -c "
import json
with open('results/final_results_20241201_120000.json') as f:
    results = json.load(f)
    for symbol, result in results.items():
        if 'final_mean_reward' in result:
            print(f'{symbol}: {result[\"final_mean_reward\"]:.4f}')
"
```

## 🏗️ Architektur

### Projektstruktur
```
rl-trading-system/
├── config/                  # Konfigurationsdateien
│   └── config.py           # Hauptkonfiguration
├── data/                   # Datenmodule
│   └── data_provider.py    # Multi-API Datenprovider
├── indicators/             # Technische Indikatoren
│   └── technical_indicators.py
├── environment/            # RL Environment
│   └── trading_env.py      # Gymnasium Trading Environment
├── training/               # Training Module
│   └── rl_trainer.py       # Stable-Baselines3 Trainer
├── models/                 # Gespeicherte Modelle
├── logs/                   # Training Logs & TensorBoard
├── results/                # Training Ergebnisse
├── main.py                 # CLI Interface
├── requirements.txt        # Dependencies
└── README.md              # Diese Datei
```

### Datenfluss
1. **Data Provider** → Historische & Realtime Daten
2. **Technical Indicators** → 15 Indikatoren berechnen & normalisieren
3. **Trading Environment** → Gymnasium Environment mit SL/TP
4. **RL Trainer** → Stable-Baselines3 Training mit Callbacks
5. **Backtest/Live** → Modell evaluieren & Trading ausführen

### Action Space
```python
# Kontinuierlicher Action Space [4D]
action = [
    action_type,    # 0.0-2.0 (Hold/Buy/Sell)
    amount,         # 0.05-1.0 (5%-100% Position Size)
    sl_percent,     # 0.01-0.05 (1%-5% Stop Loss)
    tp_percent      # 0.01-0.10 (1%-10% Take Profit)
]
```

### Observation Space
```python
# Flattened Feature Vector
observations = [
    lookback_window * num_indicators  # 60 * 15 = 900 Features
]
```

### Reward Function
```python
# Multi-Objektiv Reward
total_reward = (
    profit_return * profit_weight +           # Hauptziel: Profit
    trade_frequency_factor * frequency_weight + # Sekundär: Trade-Frequenz
    sharpe_ratio * sharpe_weight +              # Tertiär: Risk-adjusted Return
    max_drawdown * drawdown_penalty             # Strafe: Große Drawdowns
)
```

## 🎯 Best Practices

### Training
1. **Starte klein**: Beginne mit 5k-10k Timesteps für Tests
2. **Symbol-spezifisch**: Jedes Asset braucht eigenes Training
3. **Hyperparameter**: Optimiere zuerst, dann finale Training
4. **Monitoring**: Nutze TensorBoard für Live-Monitoring
5. **Evaluation**: Führe ausführliche Backtests durch

### Backtesting
1. **Multiple Episoden**: Mindestens 10-20 Episoden
2. **Out-of-Sample**: Teste auf neuen, ungesehenen Daten
3. **Verschiedene Marktbedingungen**: Bull/Bear/Sideways Markets
4. **Transaction Costs**: Realistische Kosten einbeziehen
5. **Risk Metrics**: Sharpe Ratio, Max Drawdown, Win Rate

### Live Trading
1. **Paper Trading zuerst**: Immer mit --dry-run beginnen
2. **Klein anfangen**: Kleine Position Sizes
3. **Monitoring**: Kontinuierliche Überwachung
4. **Stop-Loss**: Immer aktive Risk Management
5. **Regelmäßige Retraining**: Modelle verfallen über Zeit

## 🔍 Troubleshooting

### Häufige Probleme

#### Keine Daten verfügbar
```bash
# Problem: API Limits oder Network Issues
# Lösung: Datenquelle wechseln
python main.py test --data-source yahoo --symbol AAPL
python main.py test --data-source binance --symbol BTCUSDT
```

#### Training stürzt ab
```bash
# Problem: Memory Issues
# Lösung: Kleinere Batch Size oder weniger Environments
python main.py train --symbols BTCUSDT --timesteps 10000
```

#### Schlechte Performance
```bash
# Problem: Suboptimale Hyperparameter
# Lösung: Hyperparameter-Optimierung
python main.py optimize --symbol BTCUSDT --trials 30
```

#### Environment Errors
```bash
# Problem: Observation/Action Space Mismatch
# Lösung: Environment testen
python main.py test --component environment --symbol BTCUSDT
```

### Debug Modi
```bash
# Verbose Logging
python main.py train --log-level DEBUG --symbols BTCUSDT --timesteps 1000

# Step-by-Step Testing
python main.py test --component data
python main.py test --component indicators  
python main.py test --component environment
```

## 📈 Performance Optimization

### Training beschleunigen
```bash
# Multiprocessing (nur Crypto)
python main.py train --symbols BTCUSDT --multiprocessing --timesteps 100000

# GPU Unterstützung (PyTorch)
# Automatisch erkannt wenn CUDA verfügbar

# Kleinere Lookback Window
# In config.py: LOOKBACK_WINDOW = 30 (statt 60)
```

### Memory optimieren
```bash
# Weniger Symbole parallel
python main.py train --symbols BTCUSDT  # statt mehrere

# Kleinere Batch Sizes
# In config.py: BATCH_SIZE = 32 (statt 64)
```

## 🔮 Roadmap

### v1.1 (nächste Version)
- [ ] Live Trading Implementation
- [ ] Forex Factory News Integration
- [ ] Portfolio Mode (Multi-Asset gleichzeitig)
- [ ] Advanced Risk Management
- [ ] Web Dashboard

### v1.2 (zukünftig)
- [ ] LSTM/Transformer Features
- [ ] Ensemble Models
- [ ] Advanced Order Types
- [ ] Options/Futures Support
- [ ] Cloud Deployment

## 🤝 Beitragen

1. Fork das Repository
2. Feature Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Changes committen (`git commit -m 'Add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Pull Request öffnen

## 📝 Lizenz

Dieses Projekt steht unter der MIT Lizenz. Siehe `LICENSE` Datei für Details.

## ⚠️ Disclaimer

**RISIKOHINWEIS**: Dieses System ist zu Bildungs- und Forschungszwecken erstellt. Trading von Finanzinstrumenten birgt erhebliche Risiken. Verwenden Sie dieses System NIEMALS mit echtem Geld ohne vorherige ausführliche Tests und eigenes Verständnis der Risiken. Der Autor übernimmt keine Verantwortung für finanzielle Verluste.

## 🆘 Support

- **Issues**: GitHub Issues für Bugs und Feature Requests
- **Diskussionen**: GitHub Discussions für Fragen
- **Wiki**: Detaillierte Dokumentation im GitHub Wiki

---

**Happy Trading! 🚀📈** 