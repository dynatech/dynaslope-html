<?php

	class AisWebsocket {
		public function aisSendReport($error_msg = "", $feature = 0) {
			$status = $this->wssRequest($error_msg, $feature);
			return $status;
		}

		public function wssRequest($error_msg, $feature) {
			$dev_config = $this->getDevConfig();
			$report = $this->formatRequest($error_msg, $feature, $dev_config);
			echo "\nSending report to devs..\n\n";
			return $report;
		}

		public function formatRequest($report_details, $feature, $dev_config) {
			$mobile_ids = [];
			$report_message = "Module: ".$dev_config->modules[$feature]."\n\n";
			$report_message = $report_message."Error Message: ".$report_details."\n\n";
			for ($counter = 0; $counter < sizeOf($dev_config->data); $counter++) {
				if (in_array($feature,$dev_config->data[$counter]->internal_team) == true) {
					if ($counter == 0 ) {
						$report_message = $report_message."Devs: ".$dev_config->data[$counter]->nickname;
					} else {
						$report_message = $report_message.", ".$dev_config->data[$counter]->nickname;
					}

					for ($mobile_counter = 0; $mobile_counter < sizeOf($dev_config->data[$counter]->mobile_id); $mobile_counter++) {
						array_push($mobile_ids, $dev_config->data[$counter]->mobile_id[$mobile_counter]);
					}
				}
			}
			$report_message = $report_message." - DYNA-AIS";
			$data = [
				"message" => $report_message,
				"mobile_ids" => $mobile_ids
			];
			return $data;
		}

		public function getDevConfig() {
			$config = file_get_contents(__DIR__."/../../../../config/dev_config.json");
			return json_decode($config);
		}
    }
?>