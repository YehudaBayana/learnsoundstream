package videos

import "testing"

func TestParseProbeOutput(t *testing.T) {
	tests := []struct {
		name    string
		output  string
		want    probeResult
		wantErr bool
	}{
		{
			name:   "video and audio streams",
			output: `{"streams":[{"codec_type":"audio"},{"codec_type":"video","width":1920,"height":1080}],"format":{"duration":"12.5"}}`,
			want:   probeResult{DurationMs: 12500, Width: 1920, Height: 1080},
		},
		{
			name:   "missing duration",
			output: `{"streams":[{"codec_type":"video","width":640,"height":360}],"format":{}}`,
			want:   probeResult{Width: 640, Height: 360},
		},
		{name: "audio only", output: `{"streams":[{"codec_type":"audio"}],"format":{"duration":"3"}}`, wantErr: true},
		{name: "not json", output: `nope`, wantErr: true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			got, err := parseProbeOutput([]byte(test.output))
			if (err != nil) != test.wantErr {
				t.Fatalf("parseProbeOutput() error = %v, wantErr %v", err, test.wantErr)
			}
			if got != test.want {
				t.Errorf("parseProbeOutput() = %+v, want %+v", got, test.want)
			}
		})
	}
}
