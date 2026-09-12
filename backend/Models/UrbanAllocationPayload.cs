// Models/UrbanAllocationPayload.cs
using System;
using System.Text.Json.Serialization;

namespace ArchFinAI.Backend.Models
{
    /// <summary>
    /// Represents the Modern Portfolio Theory (MPT) asset weight distribution
    /// payload transmitted from the React dashboard to Revit 2027.
    /// </summary>
    public class UrbanAllocationPayload
    {
        [JsonPropertyName("residential")]
        public string Residential { get; set; } = "33.3";

        [JsonPropertyName("commercial")]
        public string Commercial { get; set; } = "33.3";

        [JsonPropertyName("industrial")]
        public string Industrial { get; set; } = "33.4";

        [JsonPropertyName("alertText")]
        public string AlertText { get; set; } = string.Empty;

        [JsonPropertyName("macroSentiment")]
        public string? MacroSentiment { get; set; }

        [JsonPropertyName("targetFar")]
        public double TargetFar { get; set; } = 4.5; // Floor Area Ratio

        [JsonPropertyName("sharpeRatio")]
        public double SharpeRatio { get; set; } = 1.82;

        [JsonPropertyName("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public double GetResidentialPercent() => double.TryParse(Residential, out var val) ? val : 33.33;
        public double GetCommercialPercent() => double.TryParse(Commercial, out var val) ? val : 33.33;
        public double GetIndustrialPercent() => double.TryParse(Industrial, out var val) ? val : 33.34;
    }
}
