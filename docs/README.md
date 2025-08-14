# NUVOS-APP Documentation

> Comprehensive documentation for the NUVOS-APP ecosystem

## 📚 Available Documentation

### Analytics and Monitoring System
- **[Analytics & Monitoring System](./ANALYTICS_MONITORING_SYSTEM.md)** - Complete system documentation
- **[Quick Reference Guide](./QUICK_REFERENCE_ANALYTICS.md)** - Essential daily commands
- **[Batch Analytics API](./BATCH_ANALYTICS_API.md)** - Batch processing documentation

### AI and Embeddings
- **[Embeddings & RAG Analysis](./EMBEDDINGS_RAG_ANALYSIS.md)** - Text-embedding implementation and RAG improvements

### APIs and Services
- More API documentation coming soon...

### Reward System
- **[Airdrop System](./AIRDROP_SYSTEM.md)** - Airdrop management and distribution

---

## 🚀 Quick Start Guides

### For Analytics
```powershell
# Load analytics commands
. .\scripts\analytics-commands.ps1

# Test all endpoints
Test-AllEndpoints

# Get system metrics
Get-SystemMetrics
```

### For Embeddings
```powershell
# Test embeddings service
Invoke-RestMethod -Uri "http://localhost:3000/server/gemini/embeddings/search" -Method POST -Body '{"name":"test","query":"hello"}' -ContentType "application/json"
```

### For Development
```powershell
# Start the server
npm run dev

# Run analytics
. .\scripts\analytics-commands.ps1
Start-ContinuousMonitoring
```

---

## 📋 Frequently Used Commands

### Analytics Commands
- `Get-SystemMetrics` - Current system metrics
- `Get-RealtimeMetrics` - Real-time performance data
- `Test-AllEndpoints` - Verify all endpoints
- `Start-ContinuousMonitoring` - Begin continuous monitoring

### Embeddings Commands
- Create Index: `POST /server/gemini/embeddings/index`
- Search: `POST /server/gemini/embeddings/search`
- Clear Index: `DELETE /server/gemini/embeddings/index/:name`

---

## 📁 Script File References

### PowerShell Scripts
- `scripts/analytics-commands.ps1` - Analytics and monitoring functions
- `scripts/batch-analytics.ps1` - Batch processing utilities

### Configuration Files
- `server/config/ai-config.js` - AI model configuration
- `server/config/environment.js` - Environment variables

---

## 🏗️ System Structure

### Backend Services
```
server/
├── services/
│   ├── analytics-service.js     # Analytics and metrics
│   ├── embeddings-service.js    # Text embeddings and semantic search
│   ├── gemini-service.js        # Gemini AI integration
│   └── batch-service.js         # Batch processing
├── controllers/
│   └── gemini-controller.js     # API endpoints
└── routes/
    └── gemini-routes.js         # Route definitions
```

### Frontend Components
```
src/
├── components/
│   └── GeminiChat/              # Chat interface
├── hooks/
│   └── chat/                    # Chat state management
└── utils/
    └── performance/             # Performance optimizations
```

---

## 🔄 Recommended Workflows

### Daily Development
1. Start server: `npm run dev`
2. Load analytics: `. .\scripts\analytics-commands.ps1`
3. Monitor system: `Get-SystemMetrics`
4. Test endpoints: `Test-AllEndpoints`

### Performance Monitoring
1. Start monitoring: `Start-ContinuousMonitoring`
2. Check real-time metrics: `Get-RealtimeMetrics`
3. Export data: `Export-Metrics`

### AI/Embeddings Development
1. Review current implementation: [Embeddings Analysis](./EMBEDDINGS_RAG_ANALYSIS.md)
2. Test embeddings endpoints
3. Implement RAG improvements
4. Monitor performance impact

---

## 🆘 Troubleshooting

### Common Issues
- **Server not responding**: Check `Get-SystemMetrics`
- **Analytics not working**: Reload `. .\scripts\analytics-commands.ps1`
- **Embeddings errors**: Verify API key configuration
- **Performance issues**: Use `Get-RealtimeMetrics` for diagnosis

### Quick Fixes
```powershell
# Restart server verification
Test-AllEndpoints

# Clear caches
Get-SystemInsights

# Reset analytics
Invoke-RestMethod -Uri "http://localhost:3000/server/gemini/analytics/reset" -Method POST
```

---

## 📞 Support

For technical support or questions:
1. Check the relevant documentation above
2. Review troubleshooting section
3. Test system status with analytics commands
4. Check server logs for detailed error information

---

*Last updated: $(Get-Date)*