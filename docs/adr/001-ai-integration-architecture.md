# ADR-001: AI Integration Architecture

## Status
Accepted

## Date
2025-09-10

## Context
The application requires AI-powered analysis capabilities for two primary use cases:
1. Coffee bag information extraction from photos
2. Brew quality analysis from coffee photos

We needed to choose between different AI service providers and integration patterns while ensuring the application remains functional during development and when AI services are unavailable.

## Decision
We will use OpenAI's GPT-4 Vision API with the following architectural decisions:

### AI Service Choice
- **Primary AI Provider**: OpenAI GPT-4 Vision API
- **Models Used**: 
  - `gpt-4o` for brew analysis (higher accuracy for scientific analysis)
  - `gpt-4o-mini` for bag information extraction (cost-effective for structured data)

### Integration Pattern
- **Mock-First Development**: Application includes comprehensive mock responses
- **Graceful Degradation**: Full functionality available without AI API access
- **Fallback Strategy**: Automatic fallback to mock data when API fails

### API Design
- **Dedicated Endpoints**: Separate API routes for each AI function
- **Multipart Form Data**: Support for image uploads with contextual parameters
- **Expert Prompting**: Specialized system prompts for coffee domain expertise

## Consequences

### Positive
- **Development Friendly**: Developers can work without OpenAI API keys
- **Resilient**: Application continues functioning during AI service outages
- **Cost Effective**: Mock mode reduces API usage during development
- **Domain Expertise**: Specialized prompts provide professional-grade analysis
- **Flexibility**: Easy to add new AI providers or switch services

### Negative
- **Code Complexity**: Mock data needs to be maintained alongside real AI integration
- **API Dependency**: Production features depend on external AI service
- **Cost Implications**: OpenAI API usage costs scale with application usage

### Risks and Mitigations
- **Risk**: OpenAI API rate limiting
  - **Mitigation**: Implement request queuing and retry logic
- **Risk**: AI analysis accuracy varies
  - **Mitigation**: Include confidence scores and user feedback mechanisms
- **Risk**: External service dependency
  - **Mitigation**: Comprehensive mock mode ensures core functionality

## Implementation Details

### Mock Data Strategy
```typescript
const MOCK_MODE = !process.env.OPENAI_API_KEY || 
                  process.env.OPENAI_API_KEY === 'your-openai-api-key-here'

if (MOCK_MODE) {
  return comprehensive_mock_response;
}
```

### Expert System Prompting
- Coffee consultant persona with 15+ years experience
- Scientific backing for all recommendations
- Context-aware analysis using brewing parameters
- Structured JSON response format

### Error Handling
- Graceful fallback to mock data on API failures
- Detailed error logging for debugging
- User-friendly error messages

## Alternatives Considered

1. **Google Gemini Vision**: Lower cost but less specialized for coffee analysis
2. **Anthropic Claude**: Strong reasoning but limited vision capabilities at decision time
3. **Local AI Models**: Reduced external dependency but significant infrastructure complexity
4. **No AI Integration**: Simpler architecture but missing key differentiating features

## Notes
This decision enables rapid development while maintaining production-ready AI capabilities. The mock-first approach ensures contributors can work on the project regardless of API access, while the expert prompting provides professional-grade coffee analysis when AI is available.