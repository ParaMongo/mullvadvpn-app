import * as React from 'react';
import { sprintf } from 'sprintf-js';
import styled from 'styled-components';
import { colors } from '../../config.json';
import {
  ProxyType,
  proxyTypeToString,
  RelayProtocol,
  TunnelType,
  tunnelTypeToString,
} from '../../shared/daemon-rpc-types';
import { messages } from '../../shared/gettext';
import { default as ConnectionPanelDisclosure } from '../components/ConnectionPanelDisclosure';

export interface IEndpoint {
  ip: string;
  port: number;
  protocol: RelayProtocol;
}

export interface IInAddress extends IEndpoint {
  tunnelType: TunnelType;
}

export interface IBridgeData extends IEndpoint {
  bridgeType: ProxyType;
}

export interface IOutAddress {
  ipv4?: string;
  ipv6?: string;
}

interface IProps {
  isOpen: boolean;
  hostname?: string;
  bridgeHostname?: string;
  inAddress?: IInAddress;
  bridgeInfo?: IBridgeData;
  outAddress?: IOutAddress;
  onToggle: () => void;
  className?: string;
}

const Row = styled.div({
  display: 'flex',
  flexDirection: 'row',
  marginTop: '3px',
});

const Text = styled.span({
  fontFamily: 'Open Sans',
  fontSize: '13px',
  lineHeight: '15px',
  fontWeight: 600,
  color: colors.white,
});

const Caption = styled(Text)({
  flex: 0,
  marginRight: '8px',
});

const Header = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

export default class ConnectionPanel extends React.Component<IProps> {
  public render() {
    const { inAddress, outAddress, bridgeInfo } = this.props;
    const entryPoint = bridgeInfo && inAddress ? bridgeInfo : inAddress;

    return (
      <div className={this.props.className}>
        {this.props.hostname && (
          <Header>
            <ConnectionPanelDisclosure pointsUp={this.props.isOpen} onToggle={this.props.onToggle}>
              {this.hostnameLine()}
            </ConnectionPanelDisclosure>
          </Header>
        )}

        {this.props.isOpen && this.props.hostname && (
          <React.Fragment>
            {this.props.inAddress && (
              <Row>
                <Text>{this.transportLine()}</Text>
              </Row>
            )}

            {entryPoint && (
              <Row>
                <Caption>{messages.pgettext('connection-info', 'In')}</Caption>
                <Text>
                  {`${entryPoint.ip}:${entryPoint.port} ${entryPoint.protocol.toUpperCase()}`}
                </Text>
              </Row>
            )}

            {outAddress && (outAddress.ipv4 || outAddress.ipv6) && (
              <Row>
                <Caption>{messages.pgettext('connection-info', 'Out')}</Caption>
                <div>
                  {outAddress.ipv4 && <Text>{outAddress.ipv4}</Text>}
                  {outAddress.ipv6 && <Text>{outAddress.ipv6}</Text>}
                </div>
              </Row>
            )}
          </React.Fragment>
        )}
      </div>
    );
  }

  private hostnameLine() {
    if (this.props.hostname && this.props.bridgeHostname) {
      return sprintf(
        // TRANSLATORS: The hostname line displayed below the country on the main screen
        // TRANSLATORS: Available placeholders:
        // TRANSLATORS: %(relay)s - the relay hostname
        // TRANSLATORS: %(bridge)s - the bridge hostname
        messages.pgettext('connection-info', '%(relay)s via %(bridge)s'),
        {
          relay: this.props.hostname,
          bridge: this.props.bridgeHostname,
        },
      );
    } else {
      return this.props.hostname || '';
    }
  }

  private transportLine() {
    const { inAddress, bridgeInfo } = this.props;

    if (inAddress) {
      const tunnelType = tunnelTypeToString(inAddress.tunnelType);

      if (bridgeInfo) {
        const bridgeType = proxyTypeToString(bridgeInfo.bridgeType);

        return sprintf(
          // TRANSLATORS: The tunnel type line displayed below the hostname line on the main screen
          // TRANSLATORS: Available placeholders:
          // TRANSLATORS: %(tunnelType)s - the tunnel type, i.e OpenVPN
          // TRANSLATORS: %(bridgeType)s - the bridge type, i.e Shadowsocks
          messages.pgettext('connection-info', '%(tunnelType)s via %(bridgeType)s'),
          {
            tunnelType,
            bridgeType,
          },
        );
      } else {
        return tunnelType;
      }
    } else {
      return '';
    }
  }
}
