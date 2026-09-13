// Models/UrbanAllocationPayload.cs
using System;
using System.Globalization;
using System.Text.Json.Serialization;

namespace ArchFinAI.Backend.Models
{
    /// <summary>
    /// Represents the Modern Portfolio Theory (MPT) asset weight distribution
    /// payload transmitted from the React dashboard to Revit 2027.
    /// </summary>
    public class UrbanAllocationPayload
    {
        private string _residential = "33.3";
        private string _commercial = "33.3";
        private string _industrial = "33.4";

        [JsonPropertyName("residential")]
        public object? RawResidential
        {
            get => _residential;
            set => _residential = value?.ToString() ?? "33.3";
        }

        [JsonPropertyName("commercial")]
        public object? RawCommercial
        {
            get => _commercial;
            set => _commercial = value?.ToString() ?? "33.3";
        }

        [JsonPropertyName("industrial")]
        public object? RawIndustrial
        {
            get => _industrial;
            set => _industrial = value?.ToString() ?? "33.4";
        }

        [JsonPropertyName("residentialWeight")]
        public double? ResidentialWeight
        {
            get => GetResidentialPercent();
            set { if (value.HasValue) _residential = value.Value.ToString("F2", CultureInfo.InvariantCulture); }
        }

        [JsonPropertyName("commercialWeight")]
        public double? CommercialWeight
        {
            get => GetCommercialPercent();
            set { if (value.HasValue) _commercial = value.Value.ToString("F2", CultureInfo.InvariantCulture); }
        }

        [JsonPropertyName("industrialWeight")]
        public double? IndustrialWeight
        {
            get => GetIndustrialPercent();
            set { if (value.HasValue) _industrial = value.Value.ToString("F2", CultureInfo.InvariantCulture); }
        }

        public string Residential
        {
            get => _residential;
            set => _residential = value ?? "33.3";
        }

        public string Commercial
        {
            get => _commercial;
            set => _commercial = value ?? "33.3";
        }

        public string Industrial
        {
            get => _industrial;
            set => _industrial = value ?? "33.4";
        }

        [JsonPropertyName("alertText")]
        public string AlertText { get; set; } = string.Empty;

        [JsonPropertyName("macroSentiment")]
        public string? MacroSentiment { get; set; }

        [JsonPropertyName("targetFar")]
        public double TargetFar { get; set; } = 4.5; // Floor Area Ratio

        [JsonPropertyName("sharpeRatio")]
        public double SharpeRatio { get; set; } = 1.82;

        [JsonPropertyName("expectedReturn")]
        public double ExpectedReturn { get; set; } = 0.074;

        [JsonPropertyName("volatility")]
        public double Volatility { get; set; } = 0.0565;

        [JsonPropertyName("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public double GetResidentialPercent() =>
            double.TryParse(_residential, NumberStyles.Any, CultureInfo.InvariantCulture, out var val) ? val : 33.33;

        public double GetCommercialPercent() =>
            double.TryParse(_commercial, NumberStyles.Any, CultureInfo.InvariantCulture, out var val) ? val : 33.33;

        public double GetIndustrialPercent() =>
            double.TryParse(_industrial, NumberStyles.Any, CultureInfo.InvariantCulture, out var val) ? val : 33.34;
    }
}

